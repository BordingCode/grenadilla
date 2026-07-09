// Headless tests: YIN detector vs synthesized clarinet-like tones.
// Run: node tests/pitch.test.mjs
import { detectPitch, PitchStability } from '../js/pitch/detector.js';
import {
  midiToFreq, freqToNote, soundingToWritten, writtenToSounding,
  midiToName, registerOf, WRITTEN_MIN_MIDI, WRITTEN_MAX_MIDI,
} from '../js/pitch/notes.js';

const SR = 48000;
const N = 4096;
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error('  FAIL:', msg); }
}

// Clarinet-ish tone: strong odd harmonics (1,3,5,7), weak even ones,
// slight detune wobble + breath noise, soft attack envelope.
function clarinetTone(freq, { noise = 0.01, wobbleCents = 3, phase = 0.7 } = {}) {
  const buf = new Float32Array(N);
  const harmonics = [
    [1, 1.0], [2, 0.06], [3, 0.55], [4, 0.05], [5, 0.30], [6, 0.04], [7, 0.14],
  ];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const wobble = Math.pow(2, (wobbleCents * Math.sin(2 * Math.PI * 5 * t)) / 1200);
    const f = freq * wobble;
    let s = 0;
    for (const [h, a] of harmonics) s += a * Math.sin(2 * Math.PI * f * h * t + phase * h);
    s += (Math.random() * 2 - 1) * noise;
    const env = Math.min(1, i / (0.005 * SR)); // 5ms fade-in
    buf[i] = 0.25 * s * env;
  }
  return buf;
}

console.log('1. Detection across the full written range (E3..C6):');
let maxCentsErr = 0;
for (let written = WRITTEN_MIN_MIDI; written <= WRITTEN_MAX_MIDI; written++) {
  const sounding = writtenToSounding(written);
  const f = midiToFreq(sounding);
  const { freq, clarity } = detectPitch(clarinetTone(f), { sampleRate: SR });
  assert(freq !== null, `no detection at written ${midiToName(written)} (${f.toFixed(1)} Hz)`);
  if (freq !== null) {
    const centsErr = Math.abs(1200 * Math.log2(freq / f));
    maxCentsErr = Math.max(maxCentsErr, centsErr);
    assert(centsErr < 10, `written ${midiToName(written)}: off by ${centsErr.toFixed(1)} cents`);
    const note = freqToNote(freq);
    assert(soundingToWritten(note.midi) === written,
      `written ${midiToName(written)}: mapped to ${midiToName(soundingToWritten(note.midi))}`);
    assert(clarity > 0.7, `written ${midiToName(written)}: clarity ${clarity.toFixed(2)}`);
  }
}
console.log(`   max error across range: ${maxCentsErr.toFixed(1)} cents`);

console.log('2. Silence and noise are rejected:');
assert(detectPitch(new Float32Array(N), { sampleRate: SR }).freq === null, 'silence detected as a note');
const noiseBuf = new Float32Array(N).map(() => (Math.random() * 2 - 1) * 0.2);
const noiseRes = detectPitch(noiseBuf, { sampleRate: SR });
assert(noiseRes.freq === null || noiseRes.clarity < 0.5, 'loud noise detected as a confident note');

console.log('3. Quiet playing still detects (soft dynamics):');
const soft = clarinetTone(midiToFreq(writtenToSounding(67)), {});
for (let i = 0; i < soft.length; i++) soft[i] *= 0.15; // very quiet
assert(detectPitch(soft, { sampleRate: SR }).freq !== null, 'quiet tone not detected');

console.log('4. Octave robustness at the break (throat Bb4 vs clarion B4):');
for (const written of [70, 71]) {
  const f = midiToFreq(writtenToSounding(written));
  const r = detectPitch(clarinetTone(f), { sampleRate: SR });
  const note = r.freq ? soundingToWritten(freqToNote(r.freq).midi) : null;
  assert(note === written, `break note ${midiToName(written)} misread as ${note && midiToName(note)}`);
}

console.log('5. Transposition math:');
assert(soundingToWritten(58) === 60, 'sounding Bb3 should be written C4');
assert(writtenToSounding(60) === 58, 'written C4 should sound Bb3');
assert(midiToName(60) === 'C4', 'midi 60 name');
assert(midiToName(70) === 'Bb4', 'midi 70 name (flat spelling)');

console.log('6. Registers & break constants:');
assert(registerOf(55) === 'chalumeau', 'G3 register');
assert(registerOf(68) === 'throat', 'Ab4 register');
assert(registerOf(72) === 'clarion', 'C5 register');

console.log('7. Stability tracker (steady vs wobbly):');
const steady = new PitchStability();
for (let i = 0; i < 30; i++) steady.push(2 + Math.sin(i) * 1.5);
const wobbly = new PitchStability();
for (let i = 0; i < 30; i++) wobbly.push(Math.sin(i * 0.9) * 25);
assert(steady.wobble < 5, `steady tone wobble ${steady.wobble?.toFixed(1)}`);
assert(wobbly.wobble > 10, `wobbly tone wobble ${wobbly.wobble?.toFixed(1)}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
