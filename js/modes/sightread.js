// Sight-reading — endless fresh 2-bar melodies at your level, never memorizable.
import { mic } from '../pitch/mic.js';
import { renderScore } from '../ui/notation.js';
import { state } from '../state.js';
import { taughtNotes } from '../data/lessons.js';

let onNote = null;

const SPELL = { 0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F', 6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B' };
const pitchStr = (m) => SPELL[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

export function register({ registerScreen }) {
  registerScreen('sightread', { title: 'Sight-reading', needsMic: true, init, cleanup });
}

function generate(notesPool) {
  // 2 bars of 4/4 from stepwise motion + small leaps, quarters and pairs of eighths
  const seq = [];
  let cur = notesPool[Math.floor(Math.random() * notesPool.length)];
  let beats = 0;
  while (beats < 8) {
    const remaining = 8 - beats;
    let d;
    const r = Math.random();
    if (remaining >= 2 && r < 0.18) d = 2;
    else if (remaining >= 1 && r < 0.75) d = 1;
    else d = 0.5;
    if (d > remaining) d = remaining;
    seq.push({ p: pitchStr(cur), d, midi: cur });
    beats += d;
    const near = notesPool.filter((n) => Math.abs(n - cur) <= (Math.random() < 0.75 ? 2 : 5) && n !== cur);
    cur = near.length ? near[Math.floor(Math.random() * near.length)] : cur;
  }
  // end on a longer note
  if (seq.length > 1 && seq[seq.length - 1].d < 1) { seq.pop(); seq[seq.length - 1].d += 0.5 + (8 - seq.reduce((a, n) => a + n.d, 0)); }
  return seq;
}

function init() {
  const el = document.getElementById('screen-sightread');
  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;padding:12px;">
      <div id="sr-score" style="background:rgba(0,0,0,0.22);border-radius:14px;padding:8px 12px;border:1px solid rgba(201,151,74,0.18);max-width:94vw;overflow-x:auto"></div>
      <div id="sr-status" style="font-family:var(--serif);font-size:24px;min-height:34px">Play it, left to right. In your own time.</div>
      <div style="display:flex;gap:24px;align-items:baseline">
        <div><span class="label-sm">melodies read </span><span id="sr-count" style="font-size:26px;font-family:var(--serif)">0</span></div>
        <button class="btn ghost" id="sr-skip">Skip</button>
      </div>
      <p class="hint">Fresh every time — nothing to memorize, pure reading. Wrong note? Just start the bar again from anywhere.</p>
    </div>`;

  let seq = [];
  let idx = 0;
  let count = 0;
  let score = null;

  const scoreEl = document.getElementById('sr-score');
  const status = document.getElementById('sr-status');

  function fresh() {
    let pool = [...taughtNotes(state.lessons)].filter((n) => n >= 57);
    if (pool.length < 4) pool = [64, 65, 67, 69, 70];
    seq = generate(pool);
    idx = 0;
    score = renderScore(scoreEl, { keySig: 0, timeSig: [4, 4], notes: seq }, {});
    paint();
  }

  function paint() {
    score.noteEls.forEach((g, i) => {
      g.setAttribute('color', i < idx ? 'var(--good)' : i === idx ? 'var(--brass-bright)' : 'var(--cream)');
    });
  }

  document.getElementById('sr-skip').addEventListener('click', fresh);

  onNote = (e) => {
    if (!seq.length) return;
    if (e.detail.written === seq[idx].midi) {
      idx++;
      paint();
      if (idx >= seq.length) {
        count++;
        document.getElementById('sr-count').textContent = count;
        status.textContent = 'Read. Next.';
        setTimeout(fresh, 1100);
      } else status.textContent = '…';
    }
  };
  mic.addEventListener('noteon', onNote);

  fresh();
}

function cleanup() {
  if (onNote) mic.removeEventListener('noteon', onNote);
  onNote = null;
}
