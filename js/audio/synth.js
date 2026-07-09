// Synth voices + lookahead scheduler. All sound is synthesized — no files.
// Everything routes through the master bus limiter (see ctx.js) and follows
// the house audio rules: soft attacks, no clicks, warm and modest.
import { getCtx, getMaster } from './ctx.js';
import { midiToFreq } from '../pitch/notes.js';

// ---------- voices ----------

// Clarinet-ish lead: odd-harmonic periodic wave through a gentle lowpass.
let clarinetWave = null;
function getClarinetWave(ctx) {
  if (!clarinetWave) {
    const real = new Float32Array(9);
    const imag = new Float32Array(9);
    // odd harmonics dominate: 1, 3, 5, 7
    imag[1] = 1.0; imag[2] = 0.04; imag[3] = 0.45; imag[4] = 0.03; imag[5] = 0.22; imag[7] = 0.08;
    clarinetWave = ctx.createPeriodicWave(real, imag);
  }
  return clarinetWave;
}

export function playClarinet(writtenSoundsAtMidi, when, dur, { gain = 0.22, a4 = 440 } = {}) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(getClarinetWave(ctx));
  osc.frequency.value = midiToFreq(writtenSoundsAtMidi, a4);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.045);
  g.gain.setValueAtTime(gain, Math.max(t + 0.05, t + dur - 0.08));
  g.gain.setTargetAtTime(0.0001, Math.max(t + 0.05, t + dur - 0.08), 0.03);
  osc.connect(lp); lp.connect(g); g.connect(getMaster());
  osc.start(t);
  osc.stop(t + dur + 0.25);
  return osc;
}

// Warm piano-ish: triangle + soft 2nd partial, fast decay.
export function playPiano(midi, when, dur, { gain = 0.2, a4 = 440 } = {}) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const f = midiToFreq(midi, a4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.setTargetAtTime(0.0001, t + 0.02, Math.min(0.5, dur * 0.55));
  for (const [mult, amt, type] of [[1, 1, 'triangle'], [2, 0.28, 'sine'], [3, 0.08, 'sine']]) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f * mult;
    o.detune.value = (Math.random() - 0.5) * 4;
    const og = ctx.createGain();
    og.gain.value = amt;
    o.connect(og); og.connect(g);
    o.start(t); o.stop(t + dur + 1);
  }
  g.connect(getMaster());
}

// Upright-ish bass: sine with a thump.
export function playBass(midi, when, dur, { gain = 0.26, a4 = 440 } = {}) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = midiToFreq(midi, a4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.setTargetAtTime(0.0001, t + 0.05, Math.min(0.45, dur * 0.6));
  o.connect(g); g.connect(getMaster());
  o.start(t); o.stop(t + dur + 0.6);
}

// Brush "tss" — bandpassed noise, very soft.
let noiseBuf = null;
function getNoise(ctx) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

export function playBrush(when, { gain = 0.05, accent = false } = {}) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = accent ? 5200 : 7500;
  bp.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain * (accent ? 1.5 : 1), t + 0.004);
  g.gain.setTargetAtTime(0.0001, t + 0.01, accent ? 0.07 : 0.03);
  src.connect(bp); bp.connect(g); g.connect(getMaster());
  src.start(t); src.stop(t + 0.3);
}

// Warm woodblock click for the metronome — mid-range, never shrill.
export function playClick(when, { accent = false } = {}) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(accent ? 880 : 660, t);
  o.frequency.setTargetAtTime(accent ? 640 : 480, t, 0.02);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(accent ? 0.35 : 0.22, t + 0.003);
  g.gain.setTargetAtTime(0.0001, t + 0.008, 0.035);
  o.connect(g); g.connect(getMaster());
  o.start(t); o.stop(t + 0.25);
}

// ---------- lookahead scheduler (Chris Wilson pattern) ----------
// Feed it a callback that schedules events for beat N at audio time T.
export class BeatScheduler {
  constructor({ bpm = 90, beatsPerBar = 4, onBeat, onVisualBeat }) {
    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.onBeat = onBeat;            // (beatIndex, audioTime) — schedule sound here
    this.onVisualBeat = onVisualBeat; // (beatIndex) — fired near the audible beat
    this.timer = 0;
    this.running = false;
    this.nextTime = 0;
    this.beat = 0;
    this.visualQueue = [];
    this.raf = 0;
  }
  start(startBeat = 0) {
    const ctx = getCtx();
    this.running = true;
    this.beat = startBeat;
    this.nextTime = ctx.currentTime + 0.12;
    this.visualQueue = [];
    const tick = () => {
      if (!this.running) return;
      const ahead = ctx.currentTime + 0.12;
      while (this.nextTime < ahead) {
        this.onBeat && this.onBeat(this.beat, this.nextTime);
        this.visualQueue.push({ beat: this.beat, time: this.nextTime });
        this.nextTime += 60 / this.bpm;
        this.beat++;
      }
      this.timer = setTimeout(tick, 25);
    };
    tick();
    const vis = () => {
      if (!this.running) return;
      const now = ctx.currentTime;
      while (this.visualQueue.length && this.visualQueue[0].time <= now + 0.02) {
        const ev = this.visualQueue.shift();
        this.onVisualBeat && this.onVisualBeat(ev.beat);
      }
      this.raf = requestAnimationFrame(vis);
    };
    this.raf = requestAnimationFrame(vis);
  }
  stop() {
    this.running = false;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.raf);
  }
}
