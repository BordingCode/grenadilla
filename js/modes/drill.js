// Note Drill — a written note appears ON THE STAFF; play it before the clock
// runs out or the fingering is revealed. Streak counts unaided answers.
// The window tightens as the streak grows. (He reads music — the bottleneck
// is note→grip, so the prompt is notation, not a note name.)
import { mic } from '../pitch/mic.js';
import { midiToPitchClass, midiToName } from '../pitch/notes.js';
import { fingeringSVG } from '../ui/fingering-diagram.js';
import { renderScore } from '../ui/notation.js';
import { state, save, noteRec } from '../state.js';
import { taughtNotes } from '../data/lessons.js';
import { showReg } from '../mentor/reg.js';
import { playClick } from '../audio/synth.js';

let onNote = null;
let tickTimer = 0;
let current = null;

const STARTER_POOL = [64, 65, 67, 69, 70]; // if no lessons done yet: Phase A notes
// map a midi to explicit spelling for the staff (flats)
const SPELL = { 0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F', 6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B' };
function pitchStr(m) { return SPELL[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }

export function register({ registerScreen }) {
  registerScreen('drill', { title: 'Note drill', needsMic: true, init, cleanup });
}

function pool(range) {
  let notes = [...taughtNotes(state.lessons)];
  if (!notes.length) notes = STARTER_POOL;
  if (range === 'below') notes = notes.filter((n) => n <= 70);
  if (range === 'above') notes = notes.filter((n) => n >= 71);
  return notes.length ? notes : STARTER_POOL;
}

function weightedPick(notes, avoid) {
  // never ask the same note twice in a row — a held note can't re-trigger
  if (notes.length > 1 && avoid !== null) notes = notes.filter((m) => m !== avoid);
  const weights = notes.map((m) => {
    const r = noteRec(m);
    return 1 + r.rtMs / 1000 + 2 * r.misses;
  });
  let total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < notes.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return notes[i];
  }
  return notes[notes.length - 1];
}

function init() {
  const el = document.getElementById('screen-drill');
  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.6vh;padding:10px;">
      <div style="display:flex;gap:30px;align-items:baseline">
        <div><span class="label-sm">streak </span><span id="dr-streak" style="font-size:34px;font-family:var(--serif)">0</span></div>
        <div><span class="label-sm">best </span><span id="dr-best" style="font-size:22px;font-family:var(--serif);color:var(--brass)">${state.drill.bestStreak}</span></div>
        <select id="dr-range" style="font-size:15px;background:var(--wood-warm);color:var(--cream);border:1px solid var(--brass-dim);border-radius:8px;padding:6px 10px">
          <option value="all">all my notes</option>
          <option value="below">below the break</option>
          <option value="above">over the break</option>
        </select>
      </div>
      <div id="dr-staff" style="background:rgba(0,0,0,0.22);border-radius:14px;padding:6px 10px;border:1px solid rgba(201,151,74,0.18)"></div>
      <div id="dr-timerwrap" style="width:min(480px,80vw);height:12px;border-radius:6px;background:rgba(0,0,0,0.35);overflow:hidden">
        <div id="dr-timer" style="height:100%;width:100%;background:linear-gradient(90deg,var(--brass-dim),var(--brass-bright))"></div>
      </div>
      <div id="dr-reveal" style="min-height:200px;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;transition:opacity 0.3s">
        <div class="label-sm" id="dr-reveal-label">the grip</div>
        <div id="dr-fing"></div>
      </div>
      <div class="hint" id="dr-hint">Play the written note before the clock empties. Miss it and the fingering shows — and the streak resets.</div>
      <button class="btn big" id="dr-start">Start</button>
    </div>`;

  let running = false;
  let streak = 0;
  let window0 = 3000;
  let deadline = 0;
  let promptAt = 0;
  let range = 'all';
  let last = null;

  const staffEl = document.getElementById('dr-staff');
  const streakEl = document.getElementById('dr-streak');
  const bestEl = document.getElementById('dr-best');
  const timerEl = document.getElementById('dr-timer');
  const revealEl = document.getElementById('dr-reveal');
  const fingEl = document.getElementById('dr-fing');

  document.getElementById('dr-range').addEventListener('change', (e) => (range = e.target.value));

  function ask() {
    const notes = pool(range);
    current = weightedPick(notes, last);
    last = current;
    renderScore(staffEl, { keySig: 0, timeSig: null, notes: [{ p: pitchStr(current), d: 4 }] }, { compact: true });
    revealEl.style.opacity = '0';
    const windowMs = Math.max(1200, window0 - 120 * streak);
    promptAt = performance.now();
    deadline = promptAt + windowMs;
  }

  function reveal(missed) {
    const r = noteRec(current);
    if (missed) {
      r.misses++;
      streak = 0;
      streakEl.textContent = '0';
      const twin = current >= 71 ? current - 19 : null;
      document.getElementById('dr-reveal-label').textContent =
        `${midiToPitchClass(current)}${midiToName(current).replace(/^[A-G][b#]?/, '')}` +
        (twin ? ` — it’s ${midiToPitchClass(twin)}’s grip + the register key` : (current === 71 ? ' — right hand already down' : ''));
      fingEl.innerHTML = fingeringSVG(current, { width: 128 });
      revealEl.style.opacity = '1';
      save();
      setTimeout(() => running && ask(), 2600);
    }
  }

  function tick() {
    if (!running) return;
    if (deadline === Infinity) { tickTimer = requestAnimationFrame(tick); return; } // paused during reveal
    const left = deadline - performance.now();
    timerEl.style.width = Math.max(0, (left / (deadline - promptAt)) * 100) + '%';
    if (left <= 0) {
      reveal(true);
      deadline = Infinity; // paused during reveal
    }
    tickTimer = requestAnimationFrame(tick);
  }

  onNote = (e) => {
    if (!running || current === null || deadline === Infinity) return;
    const w = e.detail.written;
    if (w === current) {
      const rt = performance.now() - promptAt;
      const r = noteRec(current);
      r.rtMs = Math.round(r.rtMs * 0.7 + rt * 0.3);
      r.drilled++;
      streak++;
      streakEl.textContent = streak;
      playClick(undefined, { accent: streak % 5 === 0 });
      if (streak > state.drill.bestStreak) {
        const wasRecord = state.drill.bestStreak >= 8;
        state.drill.bestStreak = streak;
        bestEl.textContent = streak;
        if (wasRecord && streak % 10 === 0) showReg({ context: 'drillRecord', reaction: 'brow' });
      }
      save();
      ask();
    } else if (Math.abs(w - current) > 0) {
      // a wrong note doesn't instantly fail — the clock is the judge
    }
  };
  mic.addEventListener('noteon', onNote);

  document.getElementById('dr-start').addEventListener('click', function () {
    running = !running;
    this.textContent = running ? 'Stop' : 'Start';
    if (running) { streak = 0; streakEl.textContent = '0'; ask(); tick(); }
    else cancelAnimationFrame(tickTimer);
  });
}

function cleanup() {
  if (onNote) mic.removeEventListener('noteon', onNote);
  onNote = null;
  cancelAnimationFrame(tickTimer);
  current = null;
}
