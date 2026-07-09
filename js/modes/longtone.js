// Long tones — hold a note steady; the app measures the wobble in cents.
// Research: start mid register; ±20 beginner → ±10 developing → ±5 good;
// cap ~4 min per session (embouchure fatigue reinforces bad habits).
import { mic } from '../pitch/mic.js';
import { midiToPitchClass, midiToName } from '../pitch/notes.js';
import { PitchStability } from '../pitch/detector.js';
import { logTone, noteRec, save } from '../state.js';

let onFrame = null;
let raf = 0;
let sessionStart = 0;
let restNudged = false;

const TARGETS = [67, 65, 64, 60, 62, 55, 72, 74]; // G4 first (open), then outward

export function register({ registerScreen }) {
  registerScreen('longtone', { title: 'Long tones', needsMic: true, init, cleanup });
}

function grade(wobble) {
  if (wobble === null) return null;
  if (wobble <= 5) return { label: 'steady as brass', cls: 'good' };
  if (wobble <= 10) return { label: 'settling', cls: 'ok' };
  if (wobble <= 20) return { label: 'wavering', cls: 'meh' };
  return { label: 'all over the place', cls: 'rough' };
}

function init() {
  const el = document.getElementById('screen-longtone');
  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;padding:14px;">
      <div class="label-sm">hold this note, keep the line flat</div>
      <div style="display:flex;align-items:center;gap:26px;">
        <button class="btn ghost" id="lt-prev">‹</button>
        <div class="big-note" id="lt-target" style="font-size:clamp(64px,14vh,110px)"></div>
        <button class="btn ghost" id="lt-next">›</button>
      </div>
      <canvas id="lt-canvas" width="900" height="240"
        style="width:min(860px,92vw);height:min(240px,28vh);border-radius:12px;background:rgba(0,0,0,0.28);border:1px solid rgba(201,151,74,0.2)"></canvas>
      <div style="display:flex;gap:34px;align-items:baseline;">
        <div><span class="label-sm">held </span><span id="lt-time" style="font-size:26px;font-family:var(--serif)">0.0s</span></div>
        <div><span class="label-sm">wobble </span><span id="lt-wobble" style="font-size:26px;font-family:var(--serif)">—</span></div>
        <div><span class="label-sm">verdict </span><span id="lt-grade" style="font-size:20px;font-family:var(--serif);color:var(--brass-bright)">—</span></div>
      </div>
      <div class="hint" id="lt-hint">Aim for a flat line. 4 seconds within ±20¢ is a start; ±5¢ is mastery. Best runs are logged to your tone trend.</div>
    </div>`;

  let idx = 0;
  const stab = new PitchStability(240);
  const trail = [];       // cents history for the drawing
  let holdStart = 0;      // ms when current hold began
  let lastGoodT = 0;      // ms of the last frame that matched the target
  let bestThisNote = null;
  sessionStart = Date.now();
  restNudged = false;

  const targetEl = document.getElementById('lt-target');
  const timeEl = document.getElementById('lt-time');
  const wobbleEl = document.getElementById('lt-wobble');
  const gradeEl = document.getElementById('lt-grade');
  const canvas = document.getElementById('lt-canvas');
  const ctx2d = canvas.getContext('2d');

  function setTarget(i) {
    idx = (i + TARGETS.length) % TARGETS.length;
    const m = TARGETS[idx];
    targetEl.innerHTML = `${midiToPitchClass(m)}<span class="oct">${midiToName(m).replace(/^[A-G][b#]?/, '')}</span>`;
    stab.reset(); trail.length = 0; holdStart = 0; bestThisNote = null;
    timeEl.textContent = '0.0s'; wobbleEl.textContent = '—'; gradeEl.textContent = '—';
  }
  document.getElementById('lt-prev').addEventListener('click', () => setTarget(idx - 1));
  document.getElementById('lt-next').addEventListener('click', () => setTarget(idx + 1));
  setTarget(0);

  onFrame = (e) => {
    const { written, cents } = e.detail;
    const target = TARGETS[idx];
    if (written === target) {
      if (!holdStart) holdStart = performance.now();
      lastGoodT = performance.now();
      stab.push(cents);
      trail.push(cents);
      if (trail.length > 300) trail.shift();
      const held = (performance.now() - holdStart) / 1000;
      timeEl.textContent = held.toFixed(1) + 's';
      const w = stab.wobble;
      if (w !== null) {
        wobbleEl.textContent = '±' + w.toFixed(1) + '¢';
        const g = grade(w);
        gradeEl.textContent = g.label;
        if (held >= 4 && (bestThisNote === null || w < bestThisNote)) {
          bestThisNote = w;
          logTone(w, midiToName(target));
          if (w <= 20) { const r = noteRec(target); r.seen = true; save(); }
        }
      }
    } else if (written !== null || (holdStart && performance.now() - lastGoodT > 700)) {
      // a different note, or a real gap — a single detector dropout frame does NOT end the run
      holdStart = 0; stab.reset(); trail.length = 0;
    }
    // gentle embouchure-fatigue nudge after ~4 minutes on this screen
    if (!restNudged && Date.now() - sessionStart > 4 * 60 * 1000) {
      restNudged = true;
      document.getElementById('lt-hint').textContent =
        'That’s enough lip for today. Tired long tones train bad habits — come back fresh tomorrow.';
    }
  };
  mic.addEventListener('frame', onFrame);

  const draw = () => {
    raf = requestAnimationFrame(draw);
    const w = canvas.width, h = canvas.height;
    ctx2d.clearRect(0, 0, w, h);
    // target bands: ±20 (faint), ±10, ±5 (brightest)
    const bandY = (c) => h / 2 - (c / 50) * (h / 2);
    for (const [band, alpha] of [[20, 0.05], [10, 0.08], [5, 0.13]]) {
      ctx2d.fillStyle = `rgba(143,201,122,${alpha})`;
      ctx2d.fillRect(0, bandY(band), w, bandY(-band) - bandY(band));
    }
    ctx2d.strokeStyle = 'rgba(201,151,74,0.5)';
    ctx2d.beginPath(); ctx2d.moveTo(0, h / 2); ctx2d.lineTo(w, h / 2); ctx2d.stroke();
    if (trail.length > 1) {
      ctx2d.strokeStyle = '#f0e2cc';
      ctx2d.lineWidth = 2.5;
      ctx2d.beginPath();
      trail.forEach((c, i) => {
        const x = (i / 299) * w;
        const y = h / 2 - (Math.max(-50, Math.min(50, c)) / 50) * (h / 2);
        i ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y);
      });
      ctx2d.stroke();
    }
  };
  draw();
}

function cleanup() {
  if (onFrame) mic.removeEventListener('frame', onFrame);
  onFrame = null;
  cancelAnimationFrame(raf);
}
