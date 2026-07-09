# Grenadilla — dev notes

Clarinet-learning PWA for Mathias (adult beginner, music teacher, Boehm Bb clarinet).
Live: https://bordingcode.github.io/grenadilla/ · repo BordingCode/grenadilla.
Read `docs/SPEC.md` (approved product spec), `docs/LEARNING-DESIGN.md`, `docs/EXPERIENCE-DESIGN.md`,
and the pedagogy doc `~/cc/gamedev-kb/curriculum/clarinet-grenadilla.md` before changing teaching content.

## Architecture
- Vanilla ES modules, no build. `js/main.js` imports mode modules → `boot()` in `js/app.js` (screen router).
- Every mode = one file in `js/modes/`, registering via `register({registerScreen, show, toast})`.
- **All pitch is WRITTEN clarinet pitch internally** (midi; sounding = written − 2). Playback must go
  through `writtenToSounding()` before synthesis. Never show concert pitch unless `settings.concertNames`.
- Pitch pipeline: `js/pitch/detector.js` (pure YIN, node-testable) → `js/pitch/mic.js` (singleton `mic`,
  events `frame`/`noteon`/`noteoff`) → `js/pitch/analysis.js` (NoteWatch, lesson pass checks).
- Mentor: `js/mentor/reg.js` — Reg Blackwood, verdicts 0..5 ratchet-up, copy bank in COPY. Moments only.
- Notation: `js/ui/notation.js`, hand-rolled SVG engraver. Songs store explicit spellings ('Bb4').
- State: `js/state.js`, localStorage key `grenadilla-v1`, export/import in Settings.

## Testing
- `node tests/pitch.test.mjs` — 146 assertions, detector vs synthesized clarinet tones. Run after touching pitch/notes.
- Browser without a clarinet: `window.__gren.injectTone(writtenMidi | null)` fakes mic input; `__gren.show(id)` navigates.
  A note must END (inject null ≥6 frames) before the same midi re-triggers noteon.

## Deploy gotchas (bitten already)
- **Bump `?v=` on css/main.css + js/main.js in index.html AND the `CACHE` const in sw.js on EVERY deploy**
  — the SW is cache-first; without the bump you (and Playwright) test stale code.
- GitHub Pages: `.nojekyll` present; verify live after push (deploy-verifier agent).

## Facts that must stay true
- Fingerings in `js/data/fingerings.js` are verified against wfg.woodwind.org; clarion = chalumeau grip + register key (a TWELFTH up, not an octave — the d1 lesson depends on this wording).
- The break = written Bb4 (70) → B4 (71). Range map landmark, break lessons c1–c7, drill "over the break" filter all use these constants from `js/pitch/notes.js`.
- Songs must be public domain, arranged in-range per rung (see docs/LEARNING-DESIGN §4).
- No gushing tone anywhere. Reg is grumpy about the world, exacting about music, never cruel about effort.
