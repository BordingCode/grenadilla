// Songbook data — STUB while the full sourced songbook is being arranged.
// Format: see docs/LEARNING-DESIGN + js/ui/notation.js. All pitches WRITTEN for Bb clarinet.
export const RUNG_NAMES = ['Below the break', 'Across the break', 'The full voice', 'Style & the summits'];

export const SONGS = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    source: 'Beethoven, 9th Symphony (1824) — public domain',
    category: 'classical', rung: 1, keySig: 0, timeSig: [4, 4], tempo: 100, style: 'piano',
    chords: [
      { beat: 0, sym: 'C' }, { beat: 4, sym: 'G' }, { beat: 8, sym: 'C' }, { beat: 12, sym: 'G' },
      { beat: 16, sym: 'C' }, { beat: 20, sym: 'G' }, { beat: 24, sym: 'C' }, { beat: 26, sym: 'G' }, { beat: 28, sym: 'C' },
    ],
    notes: [
      { p: 'E4', d: 1 }, { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 1 },
      { p: 'G4', d: 1 }, { p: 'F4', d: 1 }, { p: 'E4', d: 1 }, { p: 'D4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 },
      { p: 'E4', d: 1.5 }, { p: 'D4', d: 0.5 }, { p: 'D4', d: 2 },
      { p: 'E4', d: 1 }, { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 1 },
      { p: 'G4', d: 1 }, { p: 'F4', d: 1 }, { p: 'E4', d: 1 }, { p: 'D4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 },
      { p: 'D4', d: 1.5 }, { p: 'C4', d: 0.5 }, { p: 'C4', d: 2 },
    ],
  },
  {
    id: 'mester-jakob',
    title: 'Mester Jakob',
    source: 'Traditional round — public domain. Duet = the canon itself.',
    category: 'danish', rung: 1, keySig: 0, timeSig: [4, 4], tempo: 96, style: 'piano',
    chords: [{ beat: 0, sym: 'C' }, { beat: 8, sym: 'C' }, { beat: 16, sym: 'C' }, { beat: 24, sym: 'C' }],
    notes: [
      { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 2 },
      { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 2 },
      { p: 'G4', d: 0.5 }, { p: 'A4', d: 0.5 }, { p: 'G4', d: 0.5 }, { p: 'F4', d: 0.5 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'G4', d: 0.5 }, { p: 'A4', d: 0.5 }, { p: 'G4', d: 0.5 }, { p: 'F4', d: 0.5 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'G3', d: 1 }, { p: 'C4', d: 2 },
      { p: 'C4', d: 1 }, { p: 'G3', d: 1 }, { p: 'C4', d: 2 },
    ],
    duet: [
      { p: null, d: 8 },
      { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 2 },
      { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 2 },
      { p: 'G4', d: 0.5 }, { p: 'A4', d: 0.5 }, { p: 'G4', d: 0.5 }, { p: 'F4', d: 0.5 }, { p: 'E4', d: 1 }, { p: 'C4', d: 1 },
      { p: 'C4', d: 1 }, { p: 'G3', d: 1 }, { p: 'C4', d: 2 },
    ],
  },
];
