// Note math for a Bb clarinet app.
// "Written" pitch is what Mathias reads and fingers; it sounds a major 2nd lower.
// All UI shows written pitch by default (settings can show concert).

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const BB_CLARINET_TRANSPOSITION = 2; // writtenMidi = soundingMidi + 2

// Practical written range for this app: low E3 (bottom of the clarinet)
// up to C6 (enough for every song and exercise in v1).
export const WRITTEN_MIN_MIDI = 52; // E3
export const WRITTEN_MAX_MIDI = 84; // C6

export function freqToMidiFloat(freq, a4 = 440) {
  return 69 + 12 * Math.log2(freq / a4);
}

export function midiToFreq(midi, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

// Nearest MIDI note + cents deviation (-50..+50) for a frequency.
export function freqToNote(freq, a4 = 440) {
  const mf = freqToMidiFloat(freq, a4);
  const midi = Math.round(mf);
  const cents = Math.round((mf - midi) * 100);
  return { midi, cents };
}

export function soundingToWritten(midi) { return midi + BB_CLARINET_TRANSPOSITION; }
export function writtenToSounding(midi) { return midi - BB_CLARINET_TRANSPOSITION; }

// midi 60 = C4 ("middle C"). Octave number per scientific pitch notation.
export function midiToName(midi, { flats = true } = {}) {
  const names = flats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return names[pc] + octave;
}

// Display name without octave, e.g. "Bb".
export function midiToPitchClass(midi, { flats = true } = {}) {
  const names = flats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return names[((midi % 12) + 12) % 12];
}

// The registers of the (written) clarinet range — used by the range map.
export function registerOf(writtenMidi) {
  if (writtenMidi <= 65) return 'chalumeau';   // E3..F4
  if (writtenMidi <= 70) return 'throat';      // F#4..Bb4
  if (writtenMidi <= 84) return 'clarion';     // B4..C6
  return 'altissimo';
}

// "The break" sits between throat Bb4 (written midi 70) and clarion B4 (71).
export const BREAK_LOWER_MIDI = 70;
export const BREAK_UPPER_MIDI = 71;
