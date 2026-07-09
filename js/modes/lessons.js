// Lessons — the ladder. Each lesson is a live mic exercise with a pass check.
import { LESSONS, PHASES } from '../data/lessons.js';
import { NoteWatch, tonguingCheck } from '../pitch/analysis.js';
import { midiToPitchClass, midiToName } from '../pitch/notes.js';
import { fingeringSVG } from '../ui/fingering-diagram.js';
import { state, save, markNoteMastered, milestoneOnce } from '../state.js';
import { showReg, maybeFirstMeeting } from '../mentor/reg.js';
import { mic } from '../pitch/mic.js';

let watch = null;
let pollTimer = 0;
let showFn = null;
let firstMeetHook = null;

export function register({ registerScreen, show }) {
  showFn = show;
  registerScreen('lessons', { title: 'Lessons', needsMic: true, init: initList, cleanup });
}

function done(id) { return state.lessons[id] && state.lessons[id].done; }

function initList() {
  const el = document.getElementById('screen-lessons');
  let html = '<div style="flex:1;overflow-y:auto;padding:14px 22px 30px;max-width:980px;margin:0 auto;width:100%">';
  for (const ph of PHASES) {
    const items = LESSONS.filter((l) => l.phase === ph.id);
    const doneCount = items.filter((l) => done(l.id)).length;
    html += `<div class="home-section" style="margin-top:18px">${ph.title} — <span style="color:var(--brass)">${doneCount}/${items.length}</span>
      <span style="text-transform:none;letter-spacing:0;margin-left:8px">${ph.blurb}</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">`;
    for (const l of items) {
      const isDone = done(l.id);
      html += `<button class="menu-card lesson-card" data-lesson="${l.id}" style="${isDone ? 'border-color:rgba(127,176,105,0.5)' : ''}">
        <span class="name">${isDone ? '✓ ' : ''}${l.title}</span>
        <span class="desc">${l.notes.map((n) => midiToPitchClass(n)).join(' · ')}</span>
      </button>`;
    }
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
  el.querySelectorAll('[data-lesson]').forEach((b) =>
    b.addEventListener('click', () => runLesson(b.dataset.lesson)));

  if (!firstMeetHook) {
    firstMeetHook = (e) => { maybeFirstMeeting(); };
    mic.addEventListener('noteon', firstMeetHook);
  }
}

function noteChip(m, active) {
  return `<div class="lt-chip" data-note="${m}" style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${active ? 1 : 0.4}">
    <div style="font-family:var(--serif);font-size:44px">${midiToPitchClass(m)}<span style="font-size:0.5em;color:var(--cream-dim)">${midiToName(m).replace(/^[A-G][b#]?/, '')}</span></div>
  </div>`;
}

function runLesson(id) {
  const l = LESSONS.find((x) => x.id === id);
  const el = document.getElementById('screen-lessons');
  cleanup();

  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:4vw;padding:14px 24px;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto">
        <div class="label-sm">fingering</div>
        <div id="ls-fing"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:2vh;max-width:560px;min-width:0">
        <div class="label-sm">${PHASES.find((p) => p.id === l.phase).title} · ${l.title}</div>
        <div id="ls-notes" style="display:flex;gap:26px">${l.notes.map((n, i) => noteChip(n, i === 0)).join('')}</div>
        <p class="hint" style="text-align:left;max-width:none" id="ls-text">${l.predict ? '<b>Predict:</b> ' + l.predict : l.text}</p>
        <div id="ls-progress" style="height:10px;border-radius:5px;background:rgba(0,0,0,0.35);overflow:hidden">
          <div id="ls-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--brass-dim),var(--brass-bright));transition:width 0.3s"></div>
        </div>
        <div id="ls-status" class="label-sm">listening…</div>
        <div style="display:flex;gap:12px;margin-top:6px">
          ${l.predict ? '<button class="btn" id="ls-go">I’ve made my prediction — go</button>' : ''}
          <button class="btn ghost" id="ls-back">Back to lessons</button>
        </div>
      </div>
    </div>`;
  document.getElementById('ls-back').addEventListener('click', () => { cleanup(); initList(); });

  const start = () => {
    if (l.predict) document.getElementById('ls-text').innerHTML = l.text;
    beginChecks(l);
  };
  if (l.predict) document.getElementById('ls-go').addEventListener('click', function () { this.remove(); start(); });
  else start();
}

function setFing(m) { document.getElementById('ls-fing').innerHTML = fingeringSVG(m, { width: 140 }); }
function setStatus(t) { const s = document.getElementById('ls-status'); if (s) s.textContent = t; }
function setBar(f) { const b = document.getElementById('ls-bar'); if (b) b.style.width = Math.min(100, f * 100) + '%'; }

function beginChecks(l) {
  let noteIdx = 0;
  const targets = l.type === 'crossing' ? [l.to] : l.notes;
  let target = l.type === 'crossing' ? l.to : l.notes[0];
  setFing(l.type === 'crossing' ? l.from : target);
  watch = new NoteWatch(target);
  let stage = 0; // for proofs
  let crossingDone = false;

  const complete = () => {
    clearInterval(pollTimer);
    if (watch) watch.stop();
    l.notes.forEach((n) => markNoteMastered(n));
    state.lessons[l.id] = { done: true };
    save();
    setStatus('done.');
    setBar(1);
    if (l.reveal) document.getElementById('ls-text').innerHTML = `<b>${l.reveal}</b>`;
    // moments
    if (l.id === 'c3' && milestoneOnce('brokeTheBreak')) {
      marqueeBreak();
    } else if (l.id === 'a1' && milestoneOnce('firstNoteOwned')) {
      showReg({ context: 'firstNoteOwned', reaction: 'nod' });
    } else if (l.id === 'e2' && milestoneOnce('chalumeauFilled')) {
      showReg({ context: 'chalumeauFilled', reaction: 'nod' });
    } else if (l.id === 'd3' && milestoneOnce('fullRange')) {
      showReg({ context: 'fullRange', reaction: 'nod-deep', spotlight: true });
    }
    const back = document.getElementById('ls-back');
    if (back) back.textContent = 'Next — back to the ladder';
  };

  const advanceNote = () => {
    noteIdx++;
    if (noteIdx >= targets.length) return complete();
    target = targets[noteIdx];
    watch.stop();
    watch = new NoteWatch(target);
    setFing(target);
    document.querySelectorAll('#ls-notes .lt-chip').forEach((c, i) => (c.style.opacity = i === noteIdx ? 1 : 0.4));
    setStatus(`now ${midiToPitchClass(target)}…`);
  };

  pollTimer = setInterval(() => {
    if (!watch) return;
    const p = l.pass || {};
    if (l.type === 'sustain' || l.type === 'proof' && stage >= (l.steps ? l.steps.length : 0)) {
      const sus = watch.sustain(target);
      const st = watch.stats(target);
      const need = p.sustain || 2;
      setBar(sus / need);
      if (watch.squeaks && p.noSqueak) {
        setStatus('a squeak — loosen the jaw, keep the air moving');
        showReg({ context: 'squeak', reaction: 'shake' });
        watch.reset();
        return;
      }
      if (sus >= need && st) {
        const okWobble = !p.wobble || st.wobble <= p.wobble;
        const okCenter = !p.centerAbs || Math.abs(st.centerCents) <= p.centerAbs;
        if (okWobble && okCenter) {
          if (p.each && l.type === 'sustain') advanceNote();
          else complete();
        } else {
          setStatus(okWobble ? 'held — but centre it (watch the tuner)' : `held — but wobbling ±${st.wobble.toFixed(0)}¢; steadier air`);
          watch.reset();
        }
      } else if (sus > 0.4) setStatus('good — keep it going…');
    } else if (l.type === 'proof') {
      const st = watch.stats(target);
      const step = l.steps[stage];
      if (!st) return;
      const cond =
        (step.watch === 'sharp' && st.centerCents > 12) ||
        (step.watch === 'centered' && Math.abs(st.centerCents) <= 10 && watch.sustain(target) >= (l.pass.sustain || 2)) ||
        (step.watch === 'speaks' && watch.sustain(target) >= 1);
      if (cond) {
        stage++;
        watch.reset();
        if (stage < l.steps.length) {
          document.getElementById('ls-text').innerHTML = l.steps[stage].text;
          setStatus('…');
        } else {
          if (stage === l.steps.length && l.pass && l.pass.each && noteIdx < l.notes.length - 1) { advanceNote(); stage = l.steps.length; }
          else complete();
        }
      }
      setBar((stage + 1) / (l.steps.length + 1));
    } else if (l.type === 'crossing') {
      if (watch.squeaks > 0) {
        showReg({ context: 'refusalBeat', reaction: 'shake' });
        setStatus('squeak — the fingers were never the problem; keep the air moving');
        watch.reset();
        return;
      }
      const seq = watch.noteons;
      for (let i = 1; i < seq.length; i++) {
        if (seq[i - 1].written === l.from && seq[i].written === l.to && seq[i].t - seq[i - 1].t < 2500) crossingDone = true;
      }
      if (crossingDone) {
        if (l.extra) {
          const hasExtra = seq.some((n, i) => i > 0 && n.written === l.extra);
          setBar(0.7);
          setStatus(`crossed — now on to ${midiToPitchClass(l.extra)}`);
          if (hasExtra) complete();
        } else complete();
      } else {
        const started = seq.some((n) => n.written === l.from);
        setBar(started ? 0.35 : 0);
        setStatus(started ? `now up to ${midiToPitchClass(l.to)} — air through the change` : `start on ${midiToPitchClass(l.from)}`);
        if (started) setFing(l.to);
      }
    } else if (l.type === 'reveal') {
      const seq = watch.noteons;
      const heldLow = watch.sustain(l.notes[0]) >= 1;
      if (heldLow) { setBar(0.5); setStatus('good — now add the register key, nothing else'); }
      if (seq.some((n) => n.written === l.notes[1])) complete();
    } else if (l.type === 'tonguing') {
      const t = tonguingCheck(watch, l.notes[0]);
      if (t) {
        setBar(t.notes / l.pass.notes);
        setStatus(`${t.notes} tongued notes · air floor held on ${t.goodGaps}/${t.gaps} gaps`);
        if (t.notes >= l.pass.notes && t.goodGaps / t.gaps >= l.pass.goodGapRatio) complete();
      }
    }
  }, 400);
}

// The marquee: lights dim, spotlight, the deep nod, THE BREAK lights up.
function marqueeBreak() {
  const app = document.getElementById('app');
  app.style.transition = 'opacity 0.5s';
  app.style.opacity = '0.12';
  setTimeout(() => {
    showReg({ context: 'breakCrossing', reaction: 'nod-deep', spotlight: true, sticky: true });
    setTimeout(() => {
      app.style.opacity = '1';
    }, 4200);
  }, 550);
}

function cleanup() {
  clearInterval(pollTimer);
  if (watch) { watch.stop(); watch = null; }
}
