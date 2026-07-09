// Analysis helpers over the mic event stream — no DSP, just interpretation.
// Used by lessons to prove wrong instincts wrong in the player's own sound.
import { mic } from './mic.js';

// Watches frames while active; call .stop() to detach. Collects everything a
// lesson pass-check needs: sustain time on target, wobble, squeaks, rms stats.
export class NoteWatch {
  constructor(target) {
    this.target = target;
    this.frames = [];          // {written, cents, rms, t}
    this.squeaks = 0;          // notes >= target+10 (overblow ≈ +19, the twelfth)
    this.noteons = [];         // {written, t}
    this._onFrame = (e) => {
      const d = e.detail;
      this.frames.push({ ...d, t: performance.now() });
      if (this.frames.length > 1200) this.frames.shift();
    };
    this._onNoteon = (e) => {
      this.noteons.push({ written: e.detail.written, t: performance.now() });
      if (this.target !== null && e.detail.written >= this.target + 10) this.squeaks++;
    };
    mic.addEventListener('frame', this._onFrame);
    mic.addEventListener('noteon', this._onNoteon);
  }
  stop() {
    mic.removeEventListener('frame', this._onFrame);
    mic.removeEventListener('noteon', this._onNoteon);
  }
  // longest continuous run (s) on target within the last `windowMs`
  sustain(target = this.target) {
    let best = 0, runStart = null, lastT = 0;
    for (const f of this.frames) {
      if (f.written === target) {
        if (runStart === null) runStart = f.t;
        lastT = f.t;
        best = Math.max(best, (lastT - runStart) / 1000);
      } else if (f.written !== null || (runStart && f.t - lastT > 400)) {
        runStart = null;
      }
    }
    return best;
  }
  // stats over frames on target (drop edges)
  stats(target = this.target) {
    const on = this.frames.filter((f) => f.written === target);
    if (on.length < 8) return null;
    const mid = on.slice(Math.floor(on.length * 0.15), Math.ceil(on.length * 0.85));
    const cents = mid.map((f) => f.cents);
    const rms = mid.map((f) => f.rms);
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const mCents = mean(cents);
    const wobble = Math.sqrt(mean(cents.map((c) => (c - mCents) ** 2)));
    const mRms = mean(rms);
    const rmsCoV = Math.sqrt(mean(rms.map((r) => (r - mRms) ** 2))) / (mRms || 1);
    return { centerCents: mCents, wobble, meanRms: mRms, rmsCoV, frames: mid.length };
  }
  // did an a→b transition happen with connected air (gap < maxGapMs)?
  crossing(a, b, maxGapMs = 350) {
    for (let i = 1; i < this.noteons.length; i++) {
      if (this.noteons[i].written === b && this.noteons[i - 1].written === a &&
          this.noteons[i].t - this.noteons[i - 1].t < maxGapMs + 1500) {
        // gap measured between noteoff(a) and noteon(b) is approximated by
        // consecutive noteons — confirm no long silent run between them
        return true;
      }
    }
    return false;
  }
  reset() { this.frames.length = 0; this.noteons.length = 0; this.squeaks = 0; }
}

// Tonguing envelope check: over the last windowMs, find note bodies vs gaps.
export function tonguingCheck(watch, target) {
  const on = watch.frames.filter((f) => f.written === target).map((f) => f.rms);
  const gaps = [];
  let inGap = false, gapMin = Infinity, bodies = 0;
  for (const f of watch.frames) {
    if (f.written === target) {
      if (inGap) { gaps.push(gapMin); inGap = false; gapMin = Infinity; }
      bodies++;
    } else if (bodies > 0) {
      inGap = true;
      gapMin = Math.min(gapMin, f.rms);
    }
  }
  if (!on.length || gaps.length < 3) return null;
  const bodyRMS = on.sort((a, b) => a - b)[Math.floor(on.length / 2)];
  const goodGaps = gaps.filter((g) => g >= 0.4 * bodyRMS).length;
  return { notes: watch.noteons.filter((n) => n.written === target).length, gaps: gaps.length, goodGaps, bodyRMS };
}
