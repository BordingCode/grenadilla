// Boehm-system Bb clarinet fingerings, WRITTEN pitch, E3 (52) .. C6 (84).
// Source: Woodwind Fingering Guide (wfg.woodwind.org) basic fingering charts,
// cross-checked with the register twelfth rule (chalumeau fingering + register
// key sounds a twelfth higher). Primary fingerings only; common alternates noted.
//
// Key tokens:
//   T = left thumb hole          reg = register key (thumb)
//   l1 l2 l3 = left index/middle/ring    r1 r2 r3 = right index/middle/ring
//   thA = throat A key           thGs = throat G# key
//   lE = left pinky E/B lever    lFs = left pinky F#/C# lever   lCs = left pinky C#/G# key
//   rE = right pinky E/B lever   rF = right pinky F/C key
//   rFs = right pinky F#/C# lever  rAb = right pinky Ab/Eb key

const SIX = ['T', 'l1', 'l2', 'l3', 'r1', 'r2', 'r3'];

export const FINGERINGS = {
  52: { keys: [...SIX, 'lE'], alt: 'or right E/B lever' },              // E3
  53: { keys: [...SIX, 'rF'] },                                        // F3
  54: { keys: [...SIX, 'lFs'], alt: 'or right F#/C# lever' },          // F#3/Gb3
  55: { keys: [...SIX] },                                              // G3
  56: { keys: [...SIX, 'rAb'] },                                       // Ab3/G#3
  57: { keys: ['T', 'l1', 'l2', 'l3', 'r1', 'r2'] },                   // A3
  58: { keys: ['T', 'l1', 'l2', 'l3', 'r1'] },                         // Bb3/A#3
  59: { keys: ['T', 'l1', 'l2', 'l3', 'r2'] },                         // B3
  60: { keys: ['T', 'l1', 'l2', 'l3'] },                               // C4
  61: { keys: ['T', 'l1', 'l2', 'l3', 'lCs'] },                        // C#4/Db4
  62: { keys: ['T', 'l1', 'l2'] },                                     // D4
  63: { keys: ['T', 'l1', 'l2', 'rAb'] },                              // Eb4/D#4
  64: { keys: ['T', 'l1'] },                                           // E4
  65: { keys: ['T'] },                                                 // F4
  66: { keys: ['l1'] },                                                // F#4/Gb4
  67: { keys: [] },                                                    // G4 (open!)
  68: { keys: ['thGs'] },                                              // G#4/Ab4
  69: { keys: ['thA'] },                                               // A4
  70: { keys: ['thA', 'reg'] },                                        // Bb4 (throat)
  // ---- the break ----
  71: { keys: ['reg', ...SIX, 'lE'], alt: 'or right E/B lever' },      // B4
  72: { keys: ['reg', ...SIX, 'rF'] },                                 // C5
  73: { keys: ['reg', ...SIX, 'lFs'], alt: 'or right F#/C# lever' },   // C#5/Db5
  74: { keys: ['reg', ...SIX] },                                       // D5
  75: { keys: ['reg', ...SIX, 'rAb'] },                                // Eb5/D#5
  76: { keys: ['reg', 'T', 'l1', 'l2', 'l3', 'r1', 'r2'] },            // E5
  77: { keys: ['reg', 'T', 'l1', 'l2', 'l3', 'r1'] },                  // F5
  78: { keys: ['reg', 'T', 'l1', 'l2', 'l3', 'r2'] },                  // F#5/Gb5
  79: { keys: ['reg', 'T', 'l1', 'l2', 'l3'] },                        // G5
  80: { keys: ['reg', 'T', 'l1', 'l2', 'l3', 'lCs'] },                 // Ab5/G#5
  81: { keys: ['reg', 'T', 'l1', 'l2'] },                              // A5
  82: { keys: ['reg', 'T', 'l1', 'l2', 'rAb'] },                       // Bb5/A#5
  83: { keys: ['reg', 'T', 'l1'] },                                    // B5
  84: { keys: ['reg', 'T'] },                                          // C6
};

export function fingeringFor(writtenMidi) {
  return FINGERINGS[writtenMidi] || null;
}
