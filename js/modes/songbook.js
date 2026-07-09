// Songbook — shelves of folios, the club, and Reg's verdicts.
import { SONGS, RUNG_NAMES } from '../data/songs.js';
import { renderScore, parsePitch } from '../ui/notation.js';
import { mic } from '../pitch/mic.js';
import { writtenToSounding, midiToPitchClass } from '../pitch/notes.js';
import { playClarinet, playPiano, playBass, playBrush, playClick, BeatScheduler } from '../audio/synth.js';
import { getCtx, unlockAudio } from '../audio/ctx.js';
import { state, save, songRec, settings, milestoneOnce } from '../state.js';
import { taughtNotes } from '../data/lessons.js';
import { showReg, VERDICT_NAMES } from '../mentor/reg.js';

let sched = null;
let onNote = null;
let raf = 0;
let showFn = null;

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function register({ registerScreen, show }) {
  showFn = show;
  registerScreen('songbook', { title: 'Songbook', init: initShelves, cleanup: () => {} });
  registerScreen('songplay', { title: '', needsMic: true, init: initPlayer, cleanup: cleanupPlayer });
}

// ---------- shelves ----------
function songNotes(song) {
  return song.notes.filter((n) => n.p).map((n) => parsePitch(n.p).midi);
}

function initShelves() {
  const el = document.getElementById('screen-songbook');
  const known = taughtNotes(state.lessons);
  let html = '<div style="flex:1;overflow-y:auto;padding:12px 22px 30px;max-width:1060px;margin:0 auto;width:100%">';
  for (let rung = 1; rung <= 4; rung++) {
    const songs = SONGS.filter((s) => s.rung === rung);
    if (!songs.length) continue;
    html += `<div class="home-section" style="margin-top:16px">Shelf ${rung} — ${RUNG_NAMES[rung - 1]}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:11px">`;
    for (const s of songs) {
      const rec = state.songs[s.id];
      const verdict = rec ? rec.verdict : 0;
      const missing = [...new Set(songNotes(s).filter((m) => !known.has(m)))];
      const ready = missing.length === 0;
      html += `<button class="menu-card" data-song="${s.id}" style="${verdict >= 3 ? 'border-color:rgba(232,185,106,0.55);' : ''}${!ready ? 'opacity:0.65;' : ''}">
        <span class="name">${s.summit ? '⛰ ' : ''}${s.title}</span>
        <span class="desc">${s.category} · ${s.source ? s.source.split('.')[0] : ''}</span>
        <span class="desc" style="color:${verdict ? 'var(--brass-bright)' : 'var(--cream-faint)'};font-family:var(--serif);font-style:italic">
          ${verdict ? '“' + VERDICT_NAMES[verdict] + '”' : (ready ? 'Unheard' : `above your level — ${missing.length} unlearned note${missing.length > 1 ? 's' : ''}`)}</span>
      </button>`;
    }
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
  el.querySelectorAll('[data-song]').forEach((b) =>
    b.addEventListener('click', () => showFn('songplay', b.dataset.song)));
}

// ---------- chords ----------
function parseChord(sym) {
  const m = /^([A-G])(b|#)?(.*)$/.exec(sym);
  if (!m) return null;
  let pc = PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const rest = m[3] || '';
  const minor = /^m(?!aj)/.test(rest);
  const seventh = /7/.test(rest);
  const iv = [0, minor ? 3 : 4, 7];
  if (seventh) iv.push(10);
  return { pc: ((pc % 12) + 12) % 12, iv };
}

function chordAt(song, beat) {
  let cur = null;
  for (const c of song.chords || []) {
    if (c.beat <= beat + 0.01) cur = c;
    else break;
  }
  return cur ? parseChord(cur.sym) : null;
}

// ---------- player ----------
let P = null; // player session state

function initPlayer(songId) {
  const song = SONGS.find((s) => s.id === songId);
  if (!song) { showFn('songbook'); return; }
  document.getElementById('screen-title').textContent = song.title;

  const el = document.getElementById('screen-songplay');
  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;padding:6px 14px 12px;gap:8px" id="sp-wrap">
      <div id="sp-scorewrap" style="flex:1;min-height:0;display:flex;align-items:center;overflow-x:auto;overflow-y:hidden;background:rgba(0,0,0,0.25);border-radius:14px;border:1px solid rgba(201,151,74,0.18);position:relative;scroll-behavior:auto">
        <div id="sp-score" style="padding:4px 30px"></div>
        <div id="sp-playhead" style="position:absolute;top:8%;bottom:8%;width:3px;background:var(--brass-bright);opacity:0;border-radius:2px;box-shadow:0 0 10px rgba(232,185,106,0.8)"></div>
      </div>
      <div id="sp-controls" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center">
        <button class="btn big" id="sp-go">▶ Perform</button>
        <button class="btn" id="sp-practice">Practice (click only)</button>
        <label class="label-sm" style="display:flex;align-items:center;gap:8px">tempo
          <input type="range" id="sp-tempo" min="${Math.round(song.tempo * 0.55)}" max="${Math.round(song.tempo * 1.15)}" value="${song.tempo}" style="width:130px;accent-color:var(--brass)">
          <span id="sp-bpm" style="font-family:var(--serif);font-size:17px;color:var(--cream)">${song.tempo}</span>
        </label>
        ${song.duet ? '<button class="btn ghost" id="sp-duet">Duet: off</button>' : ''}
        <button class="btn ghost" id="sp-names">Names</button>
        <button class="btn ghost" id="sp-listen">Hear it</button>
        <span class="label-sm" id="sp-verdict" style="font-style:italic;color:var(--brass)">${songRec(songId).verdict ? '“' + VERDICT_NAMES[songRec(songId).verdict] + '”' : ''}</span>
      </div>
      <div id="sp-review" style="display:none;justify-content:center;gap:14px;align-items:center;flex-wrap:wrap">
        <span id="sp-result" style="font-family:var(--serif);font-size:19px"></span>
        <button class="btn" id="sp-again">Again</button>
        <button class="btn ghost" id="sp-slower">Slower</button>
      </div>
    </div>`;

  P = {
    song, songId,
    tempo: song.tempo,
    duet: false,
    names: false,
    // per-note expectations built at start
    expect: [], captured: [],
    running: false, mode: 'perform',
    score: null, startTime: 0,
  };
  drawScore();

  document.getElementById('sp-tempo').addEventListener('input', function () {
    P.tempo = +this.value;
    document.getElementById('sp-bpm').textContent = P.tempo;
  });
  if (song.duet) document.getElementById('sp-duet').addEventListener('click', function () {
    P.duet = !P.duet;
    this.textContent = 'Duet: ' + (P.duet ? 'on' : 'off');
  });
  document.getElementById('sp-names').addEventListener('click', function () {
    P.names = !P.names;
    drawScore();
  });
  document.getElementById('sp-go').addEventListener('click', () => start('perform'));
  document.getElementById('sp-practice').addEventListener('click', () => start('practice'));
  document.getElementById('sp-listen').addEventListener('click', () => start('listen'));
  document.getElementById('sp-again').addEventListener('click', () => start(P.mode === 'listen' ? 'perform' : P.mode));
  document.getElementById('sp-slower').addEventListener('click', () => {
    P.tempo = Math.max(40, Math.round(P.tempo * 0.85));
    document.getElementById('sp-tempo').value = P.tempo;
    document.getElementById('sp-bpm').textContent = P.tempo;
    start(P.mode === 'listen' ? 'perform' : P.mode);
  });

  // summit greeting
  if (song.summit && !songRec(songId).attempts) {
    showReg({ context: song.category === 'klezmer' ? 'bulgarAttempt' : 'mozartAttempt', reaction: 'brow' });
  }
}

function drawScore(colors = []) {
  P.score = renderScore(document.getElementById('sp-score'), P.song, { noteNames: P.names, colors });
}

function stopAll() {
  if (sched) sched.stop();
  sched = null;
  cancelAnimationFrame(raf);
  if (onNote) mic.removeEventListener('noteon', onNote);
  onNote = null;
  if (P) P.running = false;
}

function start(mode) {
  stopAll();
  unlockAudio();
  document.getElementById('sp-review').style.display = 'none';
  P.mode = mode;
  P.running = true;
  const song = P.song;
  const beatsPerBar = song.timeSig[0] * (4 / song.timeSig[1]);
  const countIn = beatsPerBar;
  const secPerBeat = 60 / P.tempo;

  // expectations (skip rests)
  P.expect = [];
  let b = 0;
  song.notes.forEach((n, i) => {
    if (n.p) P.expect.push({ i, midi: parsePitch(n.p).midi, start: b, end: b + n.d, hits: [] });
    b += n.d;
  });
  const totalBeats = b;
  P.captured = [];
  drawScore();

  const ctx = getCtx();
  const t0 = ctx.currentTime + 0.2;
  P.startTime = t0 + countIn * secPerBeat;

  // schedule audio
  sched = new BeatScheduler({
    bpm: P.tempo,
    onBeat: (beat, t) => {
      const songBeat = beat - countIn;
      if (songBeat < 0) { playClick(t, { accent: beat === 0 }); return; }
      if (songBeat >= totalBeats + 0.5) { finish(); return; }
      if (mode === 'practice') playClick(t, { accent: songBeat % beatsPerBar === 0 });
      if (mode === 'perform' || mode === 'listen') scheduleBacking(song, songBeat, t, beatsPerBar);
      if (mode === 'listen') {
        // play the melody itself
        for (const e of P.expect) {
          if (Math.abs(e.start - songBeat) < 0.01) playClarinet(writtenToSounding(e.midi), t, e.end - e.start === 0 ? 0.4 : (e.end - e.start) * secPerBeat * 0.92, { a4: settings.a4 });
          else if (e.start > songBeat && e.start < songBeat + 1) playClarinet(writtenToSounding(e.midi), t + (e.start - songBeat) * secPerBeat, (e.end - e.start) * secPerBeat * 0.92, { a4: settings.a4 });
        }
      }
      if (P.duet && song.duet && mode !== 'listen') {
        let db = 0;
        for (const n of song.duet) {
          if (n.p && db >= songBeat && db < songBeat + 1) {
            playClarinet(writtenToSounding(parsePitch(n.p).midi), t + (db - songBeat) * secPerBeat, n.d * secPerBeat * 0.9, { gain: 0.12, a4: settings.a4 });
          }
          db += n.d;
        }
      }
    },
  });
  sched.start();

  // capture playing
  if (mode !== 'listen') {
    onNote = (e) => {
      if (!P.running) return;
      const beat = (getCtx().currentTime - P.startTime) / secPerBeat;
      P.captured.push({ midi: e.detail.written, cents: e.detail.cents, beat });
    };
    mic.addEventListener('noteon', onNote);
  }

  // playhead
  const wrap = document.getElementById('sp-scorewrap');
  const head = document.getElementById('sp-playhead');
  head.style.opacity = '1';
  const tick = () => {
    if (!P.running) return;
    const beat = (getCtx().currentTime - P.startTime) / secPerBeat;
    if (beat >= 0) {
      const x = P.score.beatX(Math.min(beat, totalBeats));
      head.style.left = (x - wrap.scrollLeft + document.getElementById('sp-score').offsetLeft) + 'px';
      wrap.scrollLeft = Math.max(0, x - wrap.clientWidth * 0.38);
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  function finish() {
    if (!P.running) return;
    stopAll();
    document.getElementById('sp-playhead').style.opacity = '0';
    if (mode === 'listen') return;
    judge(secPerBeat);
  }
}

function scheduleBacking(song, songBeat, t, beatsPerBar) {
  const secPerBeat = 60 / P.tempo;
  for (let sub = 0; sub < 1; sub += 0.5) {
    const beat = songBeat + sub;
    const time = t + sub * secPerBeat;
    const inBar = beat % beatsPerBar;
    const ch = chordAt(song, beat);
    if (!ch) continue;
    const isTrio = song.style === 'trio';
    if (sub === 0) {
      if (inBar % 2 === 0) {
        const bassPc = inBar === 0 ? ch.pc : (ch.pc + 7) % 12;
        playBass(writtenToSounding(36 + bassPc + (bassPc < 4 ? 12 : 0)), time, secPerBeat * 1.6, { gain: isTrio ? 0.3 : 0.2 });
      }
      if (isTrio) playBrush(time, { accent: inBar === 0 });
      const compHit = isTrio ? (inBar === 1 || inBar === 3 || (beatsPerBar === 2 && inBar === 1)) : inBar === 0 || inBar === 2;
      if (compHit) {
        for (const iv of ch.iv) playPiano(writtenToSounding(60 + ((ch.pc + iv) % 12) - (ch.pc + iv >= 12 ? 0 : 0)), time, secPerBeat * 1.4, { gain: 0.085 });
      }
    } else if (isTrio && Math.random() < 0.25) {
      // light off-beat brush air
      playBrush(time, { gain: 0.02 });
    }
  }
}

// ---------- judging & review ----------
function judge(secPerBeat) {
  const TOL = 0.45; // beats around note start where an onset counts
  const colors = [];
  let sum = 0, judged = 0, wrongs = 0;
  const centsList = [];

  const used = new Set();       // each played onset may satisfy only one written note
  let prevMatched = null;       // previous expect's matched midi (for slur leniency)
  for (const e of P.expect) {
    const hits = P.captured
      .map((c, k) => ({ ...c, k }))
      .filter((c) => !used.has(c.k) && c.beat >= e.start - TOL && c.beat < Math.max(e.start + TOL, e.end - 0.15));
    let match = hits.find((h) => h.midi === e.midi);
    // slur leniency: a repeated pitch played legato produces ONE onset —
    // if the previous note was this same pitch and was matched, the held
    // tone covers this note too.
    let slurred = false;
    if (!match && prevMatched && prevMatched.midi === e.midi) {
      match = prevMatched;
      slurred = true;
    }
    let val, color;
    if (match) {
      if (!slurred) used.add(match.k);
      centsList.push(Math.abs(match.cents));
      const late = !slurred && match.beat > e.start + 0.35;
      if (Math.abs(match.cents) > 25) { val = 0.6; color = 'var(--warn)'; }
      else if (late) { val = 0.7; color = 'var(--warn)'; }
      else { val = 1.0; color = 'var(--good)'; }
      prevMatched = match;
    } else {
      val = 0; wrongs++; color = 'var(--bad)';
      prevMatched = null;
    }
    sum += val; judged++;
    colors[e.i] = color;
  }
  const score = judged ? sum / judged : 0;
  const medianCents = centsList.length ? centsList.sort((a, b) => a - b)[Math.floor(centsList.length / 2)] : 99;

  // stagger the markup in, left to right
  drawScore([]);
  P.expect.forEach((e, k) => {
    setTimeout(() => {
      const g = P.score.noteEls[e.i];
      if (g) g.setAttribute('color', colors[e.i]);
    }, 200 + k * 30);
  });

  let tier = 0;
  if (score >= 0.60) tier = 1;
  if (score >= 0.72) tier = 2;
  if (score >= 0.83) tier = 3;
  if (score >= 0.91) tier = 4;
  if (score >= 0.97 && medianCents <= 20 && wrongs <= 1) tier = 5;

  const rec = songRec(P.songId);
  rec.attempts++;
  rec.bestScore = Math.max(rec.bestScore, Math.round(score * 100));
  const climbed = tier > rec.verdict;
  if (tier > 0 && climbed) rec.verdict = tier;
  save();

  const review = document.getElementById('sp-review');
  review.style.display = 'flex';
  document.getElementById('sp-result').textContent =
    `${Math.round(score * 100)}% · ${wrongs} missed`;
  document.getElementById('sp-verdict').textContent = rec.verdict ? '“' + VERDICT_NAMES[rec.verdict] + '”' : '';

  const delay = 200 + P.expect.length * 30 + 500;
  setTimeout(() => {
    if (tier === 0) {
      showReg({ context: 'fail', reaction: 'shake' });
    } else if (P.song.summit && tier >= 4) {
      const ctxKey = P.song.category === 'klezmer' ? 'bulgarMastered' : 'mozartMastered';
      if (milestoneOnce(ctxKey)) {
        showReg({ context: ctxKey, reaction: 'nod-deep', spotlight: true, sticky: true });
        checkBothSummits();
      } else showReg({ context: 'tier' + tier, reaction: tier === 5 ? 'nod-deep' : 'nod', spotlight: tier === 5 });
    } else if (P.song.summit && tier >= 1 && tier < 4) {
      showReg({ context: 'summitNearMiss', reaction: 'brow' });
    } else {
      if (tier >= 3 && milestoneOnce('firstMastered')) showReg({ context: 'firstMastered', reaction: 'nod' });
      else showReg({ context: 'tier' + tier, reaction: tier === 5 ? 'nod-deep' : tier >= 3 ? 'nod' : tier >= 1 && climbed ? 'brow' : 'nod', spotlight: tier === 5 });
    }
  }, delay);
}

function checkBothSummits() {
  const summits = SONGS.filter((s) => s.summit);
  if (summits.length >= 2 && summits.every((s) => (state.songs[s.id]?.verdict || 0) >= 4)) {
    if (milestoneOnce('bothSummits')) {
      setTimeout(() => showReg({ context: 'bothSummits', reaction: 'nod-deep', spotlight: true, sticky: true }), 9000);
    }
  }
}

function cleanupPlayer() {
  stopAll();
  P = null;
}
