// The lesson ladder — from the researched curriculum (KB: clarinet-grenadilla.md).
// type: 'sustain' (hold target note/s) · 'proof' (guided A/B experiment)
//     · 'crossing' (note A → note B, air connected) · 'reveal' (twelfth demo)
//     · 'tonguing' (envelope check)
// pass thresholds are calibration starting points.

export const PHASES = [
  { id: 'A', title: 'Tone & the left hand', blurb: 'A steady sound, and the first grips.' },
  { id: 'B', title: 'The right hand', blurb: 'Cover the big holes completely.' },
  { id: 'C', title: 'The break', blurb: 'The wall in the middle of the instrument. Taught backwards.' },
  { id: 'D', title: 'The clarion', blurb: 'Grips you already know, a twelfth up.' },
  { id: 'E', title: 'The cellar', blurb: 'The low notes and the pinky keys.' },
  { id: 'F', title: 'The tongue', blurb: 'Separate notes without stopping the air.' },
];

export const LESSONS = [
  {
    id: 'a1', phase: 'A', title: 'First breath', notes: [67], type: 'sustain',
    text: 'Open G — no fingers at all. Just you, air, and the reed. Hold it and keep the line flat. Fast, steady air; corners of the mouth firm; jaw relaxed.',
    pass: { sustain: 3, wobble: 25, centerAbs: 20 },
  },
  {
    id: 'a2', phase: 'A', title: "Don't bite", notes: [67], type: 'proof',
    predict: 'If you BITE the reed to control the sound, does the pitch go sharp or flat?',
    steps: [
      { text: 'Play open G and deliberately bite down. Watch the needle.', watch: 'sharp' },
      { text: 'Now relax the jaw and blow FASTER air instead. Watch it centre.', watch: 'centered' },
    ],
    reveal: 'Sharp — and thin. Biting chokes the reed. Support comes from air, not jaw. You just proved it in your own sound.',
    pass: { sustain: 2, centerAbs: 10 },
  },
  {
    id: 'a3', phase: 'A', title: 'The left hand falls', notes: [65, 64], type: 'sustain',
    text: 'F: thumb alone. E: add the first finger. One finger at a time, fingers close to the keys, each note clean.',
    pass: { sustain: 2, wobble: 30, each: true },
  },
  {
    id: 'a4', phase: 'A', title: 'The weak ones', notes: [69, 70], type: 'sustain',
    text: 'Throat A and B♭. They sound thin and a little flat — that is the INSTRUMENT, not you. These are its weakest notes, and you will cross the break from them, so own them.',
    pass: { sustain: 2, each: true },
  },
  {
    id: 'a6', phase: 'A', title: 'Fill the gap', notes: [68, 66], type: 'sustain',
    text: 'G♯ with the throat key, F♯ with just the first finger (no thumb). The chromatic cluster is complete.',
    pass: { sustain: 2, each: true },
  },
  {
    id: 'b1', phase: 'B', title: 'Right hand down', notes: [62, 60], type: 'sustain',
    text: 'D, then C — the right-hand fingers arrive. The ring fingers must cover the big holes COMPLETELY; a sliver of leak is a squeak waiting to happen. Check in a mirror.',
    pass: { sustain: 2, each: true, noSqueak: true },
  },
  // ---- THE BREAK, backwards ----
  {
    id: 'c1', phase: 'C', title: 'Land on B', notes: [71], type: 'sustain',
    text: 'Start ON the far side. Clarion B: ALL fingers down (the low-E grip) plus the register key. Do not cross to it — just make it speak, clean, again and again.',
    pass: { sustain: 2, noSqueak: true },
  },
  {
    id: 'c2', phase: 'C', title: 'Step down: B → B♭', notes: [71, 70], type: 'crossing', from: 71, to: 70,
    text: 'The easy direction first. Play clarion B, then step DOWN to throat B♭ — keep the air moving through the change.',
  },
  {
    id: 'c3', phase: 'C', title: 'The crossing: B♭ → B', notes: [70, 71], type: 'crossing', from: 70, to: 71,
    predict: 'Going up this time. Clean — or squeak?',
    text: 'Throat B♭, then UP to clarion B. Nearly every finger goes down at once. The trick is not finger speed: it is air that never stops, and fingers that move together.',
  },
  { id: 'c4', phase: 'C', title: 'From open G', notes: [67, 71], type: 'crossing', from: 67, to: 71, text: 'Widen the approach: open G straight up to clarion B.' },
  { id: 'c5', phase: 'C', title: 'From G♯', notes: [68, 71], type: 'crossing', from: 68, to: 71, text: 'G♯ to B. Keep the right hand ready.' },
  { id: 'c6', phase: 'C', title: 'From A', notes: [69, 71], type: 'crossing', from: 69, to: 71, text: 'A to B. Smaller move than it sounds — if the air holds.' },
  { id: 'c7', phase: 'C', title: 'The full break', notes: [70, 71, 72], type: 'crossing', from: 70, to: 71, extra: 72, text: 'B♭ to B, then on to C. You are crossing the break. This is the wall most people fight for a month.' },
  // ---- clarion ----
  {
    id: 'd1', phase: 'D', title: 'A twelfth, not an octave', notes: [60, 79], type: 'reveal',
    predict: 'Hold low C and add ONLY the register key. It will jump — an octave up, or more?',
    text: 'Hold chalumeau C (thumb + left hand), then press the register key. Same grip.',
    reveal: 'G — a TWELFTH up (an octave plus a fifth), not an octave. The clarinet’s cylindrical bore skips to the third harmonic. That is why the break exists — and why you already know every grip up here.',
  },
  {
    id: 'd2', phase: 'D', title: 'You already know these', notes: [74, 76, 77, 79], type: 'sustain',
    text: 'Clarion D, E, F, G — each is a grip you learned below, plus the register key. The diagram will look familiar.',
    pass: { sustain: 1.5, each: true },
  },
  {
    id: 'd3', phase: 'D', title: 'Over the top', notes: [72, 73, 75], type: 'sustain',
    text: 'Clarion C, C♯ and E♭ — the pinky keys come along for the ride, a twelfth above where you met them.',
    pass: { sustain: 1.5, each: true },
  },
  // ---- low register ----
  {
    id: 'e1', phase: 'E', title: 'Make the cellar speak', notes: [53, 52], type: 'proof',
    predict: 'The low notes won’t speak. Blow HARDER — or relax?',
    steps: [
      { text: 'Low F, then low E — all fingers, pinky key. If it chokes, do NOT force it.', watch: 'speaks' },
      { text: 'Relax the jaw, slow warm air, let it bloom.', watch: 'speaks' },
    ],
    reveal: 'Relax. Biting kills the low notes; steady air opens them.',
    pass: { sustain: 2, each: true },
  },
  {
    id: 'e2', phase: 'E', title: 'The last corners', notes: [54, 55, 56, 57, 58, 59, 61, 63], type: 'sustain',
    text: 'F♯, G, A♭, A, B♭, B, C♯, E♭ — the remaining chalumeau notes. Take them slowly; several want a pinky.',
    pass: { sustain: 1.5, each: true },
  },
  // ---- articulation ----
  {
    id: 'f1', phase: 'F', title: 'The air never stops', notes: [67], type: 'tonguing',
    predict: 'To separate notes: stop the AIR, or stop the REED?',
    text: 'Sustain open G and separate it again and again with the tip of the tongue on the tip of the reed — tee, tee, tee. The air keeps flowing; the tongue only interrupts it. Watch your envelope: a huffer collapses to silence between notes; a good tongue leaves notches on a floor of air.',
    reveal: 'Stop the reed. If the floor of your envelope stayed up, the air never quit — that is the whole secret.',
    pass: { notes: 6, goodGapRatio: 0.5 },
  },
];

export function lessonById(id) { return LESSONS.find((l) => l.id === id); }

// A note is "taught" when some completed lesson introduced it.
export function taughtNotes(doneMap) {
  const set = new Set();
  for (const l of LESSONS) if (doneMap[l.id] && doneMap[l.id].done) l.notes.forEach((n) => set.add(n));
  return set;
}
