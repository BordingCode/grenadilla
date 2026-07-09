// Echo — hear a phrase, play it back by ear. No notation on screen.
// Includes klezmer fragments built on the freygish ♭2–3 leap.
import { mic } from '../pitch/mic.js';
import { writtenToSounding, midiToPitchClass } from '../pitch/notes.js';
import { playClarinet } from '../audio/synth.js';
import { getCtx, unlockAudio } from '../audio/ctx.js';
import { state } from '../state.js';
import { taughtNotes } from '../data/lessons.js';
import { settings } from '../state.js';

let onNote = null;

const KLEZMER_FRAGS = [
  [62, 63, 62],                    // D–Eb–D: the ♭2 sigh
  [62, 63, 66, 63, 62],            // the augmented-2nd leap Eb→F#
  [66, 67, 69, 67, 66],            // F#–G–A–G–F#
  [69, 70, 69, 67, 66],            // A–Bb–A: the ♭6, falling home
  [62, 66, 67, 69, 67, 66, 63, 62],// a little freygish run
];

export function register({ registerScreen }) {
  registerScreen('echo', { title: 'Echo', needsMic: true, init, cleanup });
}

function init() {
  const el = document.getElementById('screen-echo');
  el.innerHTML = `
    <div class="center-col">
      <div style="display:flex;gap:12px">
        <button class="btn ghost eo-mode" data-mode="notes" style="border-color:var(--brass)">My notes</button>
        <button class="btn ghost eo-mode" data-mode="klezmer">Klezmer</button>
      </div>
      <div id="eo-dots" style="display:flex;gap:14px;min-height:40px"></div>
      <div id="eo-status" style="font-family:var(--serif);font-size:26px;min-height:36px">Press play, listen, then play it back.</div>
      <div style="display:flex;gap:14px">
        <button class="btn big" id="eo-play">▶ Play phrase</button>
        <button class="btn ghost" id="eo-new">New phrase</button>
      </div>
      <div><span class="label-sm">phrases echoed </span><span id="eo-count" style="font-size:24px;font-family:var(--serif)">0</span></div>
      <p class="hint" id="eo-hint">By ear only — that’s the point. Klezmer grows from the voice; listen for the leap.</p>
    </div>`;

  let mode = 'notes';
  let phrase = [];
  let progress = 0;
  let count = 0;
  let listening = false;

  const dots = document.getElementById('eo-dots');
  const status = document.getElementById('eo-status');

  function newPhrase() {
    if (mode === 'klezmer') {
      phrase = KLEZMER_FRAGS[Math.floor(Math.random() * KLEZMER_FRAGS.length)];
    } else {
      let notes = [...taughtNotes(state.lessons)];
      if (notes.length < 3) notes = [64, 65, 67, 69];
      const len = 3 + Math.floor(Math.random() * 2);
      phrase = [];
      let cur = notes[Math.floor(Math.random() * notes.length)];
      for (let i = 0; i < len; i++) {
        phrase.push(cur);
        const near = notes.filter((n) => Math.abs(n - cur) <= 4 && n !== cur);
        const fallback = notes.filter((n) => n !== cur);
        const from = near.length ? near : (fallback.length ? fallback : notes);
        cur = from[Math.floor(Math.random() * from.length)];
      }
    }
    progress = 0;
    listening = false;
    drawDots();
    status.textContent = 'Press play and listen.';
  }

  function drawDots() {
    dots.innerHTML = phrase.map((_, i) =>
      `<div style="width:22px;height:22px;border-radius:50%;border:2px solid var(--brass-dim);background:${i < progress ? 'var(--brass-bright)' : 'none'}"></div>`).join('');
  }

  function playPhrase() {
    unlockAudio();
    const ctx = getCtx();
    let t = ctx.currentTime + 0.15;
    for (const m of phrase) {
      playClarinet(writtenToSounding(m), t, 0.55, { a4: settings.a4 });
      t += 0.62;
    }
    listening = false;
    status.textContent = 'Listen…';
    setTimeout(() => { listening = true; progress = 0; drawDots(); status.textContent = 'Now you.'; }, (t - ctx.currentTime) * 1000 + 200);
  }

  document.getElementById('eo-play').addEventListener('click', playPhrase);
  document.getElementById('eo-new').addEventListener('click', newPhrase);
  el.querySelectorAll('.eo-mode').forEach((b) => b.addEventListener('click', function () {
    mode = this.dataset.mode;
    el.querySelectorAll('.eo-mode').forEach((x) => (x.style.borderColor = ''));
    this.style.borderColor = 'var(--brass)';
    newPhrase();
  }));

  onNote = (e) => {
    if (!listening || !phrase.length) return;
    if (e.detail.written === phrase[progress]) {
      progress++;
      drawDots();
      if (progress >= phrase.length) {
        count++;
        document.getElementById('eo-count').textContent = count;
        status.textContent = 'Yes. That’s the one.';
        listening = false;
        setTimeout(newPhrase, 1400);
      }
    } else if (progress > 0 && e.detail.written !== phrase[progress - 1]) {
      progress = 0;
      drawDots();
      status.textContent = `Not quite — it starts on ${midiToPitchClass(phrase[0])}. Hear it again?`;
    }
  };
  mic.addEventListener('noteon', onNote);

  newPhrase();
}

function cleanup() {
  if (onNote) mic.removeEventListener('noteon', onNote);
  onNote = null;
}
