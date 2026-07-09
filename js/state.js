// Progress + settings, localStorage-backed, with export/import.
const KEY = 'grenadilla-v1';

const DEFAULTS = {
  version: 1,
  settings: {
    a4: 440,               // tuner reference, 438..445
    concertNames: false,   // false = clarinet-written note names (default)
    sound: true,
  },
  // Per written-midi note mastery: { seen, drilled, mastered }
  notes: {},
  // Per song id: { verdict: 0..4, attempts, bestScore }
  songs: {},
  // Per lesson id: { done: true }
  lessons: {},
  // Long-tone history: [{day: 'YYYY-MM-DD', bestWobble, note}]
  toneLog: [],
  // Note-drill best streak
  drill: { bestStreak: 0 },
  // Milestone recordings index (audio blobs live in IndexedDB): [{id, day, label}]
  recordings: [],
  firstRun: true,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { ...structuredClone(DEFAULTS), ...data, settings: { ...DEFAULTS.settings, ...(data.settings || {}) } };
    }
  } catch (e) { /* corrupt save: start fresh rather than crash */ }
  return structuredClone(DEFAULTS);
}

export const state = load();
export const settings = state.settings;

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
}

export function noteRec(written) {
  if (!state.notes[written]) state.notes[written] = { seen: false, drilled: 0, mastered: false };
  return state.notes[written];
}

export function markNoteSeen(written) { noteRec(written).seen = true; save(); }
export function markNoteMastered(written) { const r = noteRec(written); r.seen = true; r.mastered = true; save(); }

export function songRec(id) {
  if (!state.songs[id]) state.songs[id] = { verdict: 0, attempts: 0, bestScore: 0 };
  return state.songs[id];
}

export function logTone(bestWobble, note) {
  const day = new Date().toISOString().slice(0, 10);
  state.toneLog.push({ day, bestWobble: Math.round(bestWobble * 10) / 10, note });
  if (state.toneLog.length > 400) state.toneLog.shift();
  save();
}

export function exportData() {
  return JSON.stringify(state, null, 2);
}

export function importData(json) {
  const data = JSON.parse(json); // throws on bad JSON — caller shows the error
  if (typeof data !== 'object' || !data.version) throw new Error('Not a Grenadilla backup file');
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, { ...structuredClone(DEFAULTS), ...data });
  save();
}
