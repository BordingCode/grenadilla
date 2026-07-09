// SVG music engraving — one horizontal system, made to be read BIG from ~1 m.
// Songs store explicit spellings ("Eb4", "F#5") so nothing is guessed.
//
// renderScore(el, song, opts) → { noteEls, beatX(beat), totalBeats, svg }
//   song: { keySig: -1..+7 (flats negative), timeSig: [4,4], notes: [...] }
//   note: { p: 'G4'|null (rest), d: beats, tie?: bool }
// opts: { noteNames: bool, colors: [] per-note fill overrides }

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ALTER = { '': 0, '#': 1, b: -1, x: 2, bb: -2 };
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
// staff y positions for key signature glyphs (treble)
const SHARP_Y = { F: 30, C: 60, G: 20, D: 50, A: 80, E: 40, B: 70 };
const FLAT_Y = { B: 70, E: 40, A: 90, D: 50, G: 100, C: 60, F: 110 };

export function parsePitch(p) {
  const m = /^([A-G])(bb|b|#|x)?(\d)$/.exec(p);
  if (!m) throw new Error('bad pitch ' + p);
  const [, letter, acc = '', octStr] = m;
  const octave = +octStr;
  const alter = ALTER[acc];
  const midi = 12 * (octave + 1) + LETTER_PC[letter] + alter;
  return { letter, alter, octave, midi };
}

// Vertical position: diatonic steps above E4 (bottom staff line), 10 units/step.
function stepIndex(letter, octave) {
  return (octave - 4) * 7 + LETTER_STEP[letter] - LETTER_STEP.E;
}

const STAFF_TOP = 20;        // y of top line (F5)
const LINE_GAP = 20;
const STAFF_BOTTOM = STAFF_TOP + LINE_GAP * 4; // E4 line
const H = 190;

function yFor(letter, octave) {
  return STAFF_BOTTOM - stepIndex(letter, octave) * (LINE_GAP / 2);
}

function keyAccidentals(keySig) {
  const map = {};
  if (keySig > 0) SHARP_ORDER.slice(0, keySig).forEach((l) => (map[l] = 1));
  if (keySig < 0) FLAT_ORDER.slice(0, -keySig).forEach((l) => (map[l] = -1));
  return map;
}

const NS = 'http://www.w3.org/2000/svg';
function make(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

// Simplified treble clef drawn as a path (no font dependence).
function drawClef(g, x) {
  const p = make('path', {
    d: `M ${x + 14} ${STAFF_TOP + 108}
        c -10 0 -16 -7 -16 -15 c 0 -8 6 -13 12 -13 c 7 0 11 5 11 11
        c 0 9 -8 14 -16 14
        M ${x + 12} ${STAFF_TOP + 92}
        C ${x - 2} ${STAFF_TOP + 60} ${x + 26} ${STAFF_TOP + 48} ${x + 26} ${STAFF_TOP + 28}
        c 0 -12 -8 -22 -14 -22 c -6 0 -10 8 -10 16 c 0 30 8 60 12 92
        c 1 8 0 16 -8 16`,
    fill: 'none', stroke: 'currentColor', 'stroke-width': 3.4, 'stroke-linecap': 'round',
  }, g);
  return p;
}

function drawAccidental(g, kind, x, y) {
  // kind: 1 sharp, -1 flat, 0 natural — drawn with strokes, no font.
  if (kind === 1) {
    for (const dx of [-3, 3]) make('line', { x1: x + dx, y1: y - 12, x2: x + dx, y2: y + 12, stroke: 'currentColor', 'stroke-width': 1.8 }, g);
    for (const dy of [-4.5, 4.5]) make('line', { x1: x - 7, y1: y + dy + 2, x2: x + 7, y2: y + dy - 2, stroke: 'currentColor', 'stroke-width': 3 }, g);
  } else if (kind === -1) {
    make('line', { x1: x - 4, y1: y - 16, x2: x - 4, y2: y + 6, stroke: 'currentColor', 'stroke-width': 1.8 }, g);
    make('path', { d: `M ${x - 4} ${y + 6} c 8 -6 9 -12 4 -13 c -2 -0.5 -4 1 -4 3`, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }, g);
  } else {
    make('line', { x1: x - 4, y1: y - 12, x2: x - 4, y2: y + 6, stroke: 'currentColor', 'stroke-width': 1.6 }, g);
    make('line', { x1: x + 4, y1: y - 6, x2: x + 4, y2: y + 12, stroke: 'currentColor', 'stroke-width': 1.6 }, g);
    for (const dy of [-5, 3]) make('line', { x1: x - 4, y1: y + dy + 1.5, x2: x + 4, y2: y + dy - 1.5, stroke: 'currentColor', 'stroke-width': 2.6 }, g);
  }
}

export function renderScore(container, song, opts = {}) {
  const { noteNames = false, colors = [], compact = false } = opts;
  const keyAcc = keyAccidentals(song.keySig || 0);
  const beatsPerBar = song.timeSig ? song.timeSig[0] : 4;

  const PER_BEAT = compact ? 46 : 64;
  const LEFT = 150;

  // measure width first
  let totalBeats = 0;
  for (const n of song.notes) totalBeats += n.d;
  const width = LEFT + totalBeats * PER_BEAT + 60;

  container.innerHTML = '';
  const svg = make('svg', {
    viewBox: `0 0 ${width} ${H}`,
    width: width * (compact ? 0.85 : 1.15),
    height: H * (compact ? 0.85 : 1.15),
    style: 'color:var(--cream);display:block',
  });
  container.appendChild(svg);

  // staff lines
  for (let i = 0; i < 5; i++) {
    make('line', { x1: 10, y1: STAFF_TOP + i * LINE_GAP, x2: width - 10, y2: STAFF_TOP + i * LINE_GAP, stroke: 'currentColor', 'stroke-width': 1.1, opacity: 0.75 }, svg);
  }
  drawClef(svg, 20);

  // key signature
  let ksX = 62;
  if (song.keySig > 0) SHARP_ORDER.slice(0, song.keySig).forEach((l) => { drawAccidental(svg, 1, ksX, STAFF_TOP + SHARP_Y[l] - 20 + 10); ksX += 14; });
  if (song.keySig < 0) FLAT_ORDER.slice(0, -song.keySig).forEach((l) => { drawAccidental(svg, -1, ksX, STAFF_TOP + FLAT_Y[l] - 20 + 6); ksX += 13; });

  // time signature
  if (song.timeSig) {
    const [num, den] = song.timeSig;
    make('text', { x: ksX + 16, y: STAFF_TOP + 34, 'font-size': 34, 'font-family': 'Georgia,serif', 'font-weight': 'bold', fill: 'currentColor', 'text-anchor': 'middle' }, svg).textContent = num;
    make('text', { x: ksX + 16, y: STAFF_TOP + 74, 'font-size': 34, 'font-family': 'Georgia,serif', 'font-weight': 'bold', fill: 'currentColor', 'text-anchor': 'middle' }, svg).textContent = den;
  }

  const noteEls = [];
  let beat = 0;
  // accidental state resets each bar: letter+octave → alter currently in force
  let barState = {};

  for (let i = 0; i < song.notes.length; i++) {
    const n = song.notes[i];
    const x = LEFT + beat * PER_BEAT;
    const barPos = beat % beatsPerBar;

    // barline just before a note that starts a new bar (except the very first)
    if (barPos === 0 && beat > 0) {
      make('line', { x1: x - 26, y1: STAFF_TOP, x2: x - 26, y2: STAFF_BOTTOM, stroke: 'currentColor', 'stroke-width': 1.2, opacity: 0.7 }, svg);
      barState = {};
    }

    const g = make('g', { class: 'note', 'data-i': i }, svg);
    if (colors[i]) g.setAttribute('color', colors[i]);

    if (!n.p) {
      // rest
      const cy = STAFF_TOP + 2 * LINE_GAP;
      if (n.d >= 4) make('rect', { x: x - 8, y: cy - LINE_GAP / 2, width: 18, height: 7, fill: 'currentColor' }, g);
      else if (n.d >= 2) make('rect', { x: x - 8, y: cy - 7, width: 18, height: 7, fill: 'currentColor' }, g);
      else make('path', { d: `M ${x} ${cy - 14} c 6 6 -4 10 2 16 c -8 -2 -6 -8 -2 -16 m 2 16 c -3 6 -1 8 2 12`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 }, g);
      noteEls.push(g);
      beat += n.d;
      continue;
    }

    const { letter, alter, octave } = parsePitch(n.p);
    const y = yFor(letter, octave);

    // ledger lines
    const step = stepIndex(letter, octave);
    if (step <= -2) for (let s = -2; s >= step; s -= 2) make('line', { x1: x - 15, y1: STAFF_BOTTOM - s * (LINE_GAP / 2), x2: x + 15, y2: STAFF_BOTTOM - s * (LINE_GAP / 2), stroke: 'currentColor', 'stroke-width': 1.2 }, g);
    if (step >= 10) for (let s = 10; s <= step; s += 2) make('line', { x1: x - 15, y1: STAFF_BOTTOM - s * (LINE_GAP / 2), x2: x + 15, y2: STAFF_BOTTOM - s * (LINE_GAP / 2), stroke: 'currentColor', 'stroke-width': 1.2 }, g);

    // accidental if this spelling differs from the bar's current state
    const inForce = barState[letter + octave] !== undefined ? barState[letter + octave] : (keyAcc[letter] || 0);
    if (alter !== inForce) {
      drawAccidental(g, alter === 0 ? 0 : alter, x - 22, y);
      barState[letter + octave] = alter;
    }

    // notehead
    const open = n.d >= 2;
    make('ellipse', {
      cx: x, cy: y, rx: 9.5, ry: 7, transform: `rotate(-18 ${x} ${y})`,
      fill: open ? 'none' : 'currentColor', stroke: 'currentColor', 'stroke-width': open ? 2.4 : 1,
    }, g);

    // dot
    if (n.d === 1.5 || n.d === 3 || n.d === 6) {
      const dotY = (step % 2 === 0) ? y - LINE_GAP / 4 - 1 : y; // on a line → dot in space above
      make('circle', { cx: x + 15, cy: dotY, r: 2.6, fill: 'currentColor' }, g);
    }

    // stem + flag (whole notes get none)
    if (n.d < 4) {
      const up = step < 4; // below middle line → stem up
      const sx = up ? x + 8.5 : x - 8.5;
      const sy2 = up ? y - 62 : y + 62;
      make('line', { x1: sx, y1: y + (up ? -2 : 2), x2: sx, y2: sy2, stroke: 'currentColor', 'stroke-width': 2 }, g);
      if (n.d < 1) {
        make('path', {
          d: up
            ? `M ${sx} ${sy2} c 12 6 14 18 8 30 c 2 -12 -2 -18 -8 -20`
            : `M ${sx} ${sy2} c 12 -6 14 -18 8 -30 c 2 12 -2 18 -8 20`,
          fill: 'currentColor',
        }, g);
      }
    }

    // note-name hint
    if (noteNames) {
      make('text', { x, y: H - 8, 'font-size': 15, fill: 'var(--brass)', 'text-anchor': 'middle', 'font-family': 'Georgia,serif' }, g).textContent =
        letter + (alter === 1 ? '♯' : alter === -1 ? '♭' : '');
    }

    noteEls.push(g);
    beat += n.d;
  }

  // final barline
  make('line', { x1: width - 24, y1: STAFF_TOP, x2: width - 24, y2: STAFF_BOTTOM, stroke: 'currentColor', 'stroke-width': 3 }, svg);

  return {
    svg,
    noteEls,
    totalBeats,
    beatX: (b) => (LEFT + b * PER_BEAT) * (compact ? 0.85 : 1.15),
  };
}
