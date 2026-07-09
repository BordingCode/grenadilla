// YIN pitch detector (de Cheveigné & Kawahara 2002), pure JS on a Float32Array.
// Pure so it can be unit-tested in Node with synthesized tones — no Web Audio here.
//
// Tuned for clarinet: sounding fundamentals in this app span roughly
// D3 (~147 Hz) to Bb5 (~932 Hz). The clarinet's strong odd harmonics are
// exactly what plain autocorrelation trips over; YIN's cumulative mean
// normalization handles them well.

const DEFAULT_OPTS = {
  sampleRate: 48000,
  threshold: 0.12,   // CMNDF dip threshold; lower = stricter
  minFreq: 110,      // generous floor below low D3
  maxFreq: 1200,     // ceiling above top of v1 range
  rmsGate: 0.008,    // below this RMS the frame is "silence"
};

export function detectPitch(buf, opts = {}) {
  const { sampleRate, threshold, minFreq, maxFreq, rmsGate } = { ...DEFAULT_OPTS, ...opts };
  const n = buf.length;

  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < rmsGate) return { freq: null, clarity: 0, rms };

  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(Math.floor(sampleRate / minFreq), Math.floor(n / 2));
  if (tauMax <= tauMin) return { freq: null, clarity: 0, rms };

  // Difference function d(tau), then cumulative-mean-normalized d'(tau).
  const d = new Float32Array(tauMax + 1);
  for (let tau = tauMin; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < n - tauMax; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  const cmndf = new Float32Array(tauMax + 1);
  cmndf[tauMin - 1] = 1;
  let running = 0;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    running += d[tau];
    cmndf[tau] = running > 0 ? (d[tau] * (tau - tauMin + 1)) / running : 1;
  }

  // First dip under threshold; walk to its local minimum.
  let tau = -1;
  for (let t = tauMin + 1; t <= tauMax; t++) {
    if (cmndf[t] < threshold) {
      while (t + 1 <= tauMax && cmndf[t + 1] < cmndf[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau === -1) {
    // No dip under threshold: fall back to the global minimum if it's decent.
    let best = tauMin, bestVal = Infinity;
    for (let t = tauMin; t <= tauMax; t++) {
      if (cmndf[t] < bestVal) { bestVal = cmndf[t]; best = t; }
    }
    if (bestVal > 0.35) return { freq: null, clarity: Math.max(0, 1 - bestVal), rms };
    tau = best;
  }

  // Parabolic interpolation around the minimum for sub-sample precision.
  let betterTau = tau;
  if (tau > tauMin && tau < tauMax) {
    const s0 = cmndf[tau - 1], s1 = cmndf[tau], s2 = cmndf[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-12) betterTau = tau + (s2 - s0) / denom;
  }

  const freq = sampleRate / betterTau;
  if (freq < minFreq || freq > maxFreq) return { freq: null, clarity: 0, rms };
  return { freq, clarity: Math.max(0, Math.min(1, 1 - cmndf[tau])), rms };
}

// Rolling stability tracker for long tones: feed it detections, it reports
// how steady the pitch is (std dev in cents over the window).
export class PitchStability {
  constructor(windowSize = 30) {
    this.windowSize = windowSize;
    this.cents = [];
  }
  push(centsFromTarget) {
    this.cents.push(centsFromTarget);
    if (this.cents.length > this.windowSize) this.cents.shift();
  }
  reset() { this.cents = []; }
  get count() { return this.cents.length; }
  // Standard deviation in cents; null until we have a few frames.
  get wobble() {
    if (this.cents.length < 5) return null;
    const mean = this.cents.reduce((a, b) => a + b, 0) / this.cents.length;
    const v = this.cents.reduce((a, c) => a + (c - mean) * (c - mean), 0) / this.cents.length;
    return Math.sqrt(v);
  }
  get mean() {
    if (!this.cents.length) return null;
    return this.cents.reduce((a, b) => a + b, 0) / this.cents.length;
  }
}
