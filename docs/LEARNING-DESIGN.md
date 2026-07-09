# Grenadilla — Learning Design
(Produced by the learning-designer agent against the pedagogy doc ~/cc/gamedev-kb/curriculum/clarinet-grenadilla.md. Implementation truth lives in code; this is the teaching spec.)

## 0. Analysis helpers (js/pitch/analysis.js) — all from existing frame/noteon events
- squeak(target): noteon/3+ frames with written >= target+10 (classic overblow = +19, the twelfth) while chalumeau/throat target expected
- wontSpeak(target): no noteon at target within 1.5s or undertone below
- sharpBias(target): mean cents > +15 for >=0.8s (biting)
- centerCents(target): mean cents over stable middle (drop first/last 0.3s)
- bodyRMS/gapRMS: median rms during notes vs min rms in gaps (huffing proof: good tonguing keeps gapRMS >= 0.4*bodyRMS)
- airGap(a,b): seconds noteoff(a)->noteon(b); <0.35s = air stayed connected (break crossing)
- scoop(target): starts >=40c flat, rises monotonically to +-15 within 0.3s (klezmer slide)
- stability: PitchStability std-dev cents

## 1. Lesson ladder (js/data/lessons.js)
Phase A (tone/air/left hand): a1-first-breath (G4 >=3s wobble<=25 |cents|<=20) · a2-biting-proof (predict: bite -> sharp spike + thin tone; then centred G4 |cents|<=10) · a3-left-hand (F4,E4) · a4-throat-tones (A4,Bb4 — weakness is the INSTRUMENT's) · a5-resonance (throat A naked vs +right-hand resonance: delta cents >= +8, delta rms > 0) · a6-cluster (G#4,F#4)
Phase B: b1-right-hand (D4,C4; ring-finger coverage; squeak/wontSpeak = leak teaching)
Phase C — THE BREAK, backwards: c1-land-on-B (start ON clarion B4, clean >=2s, no squeak) · c2 B->Bb down · c3 Bb->B up (predict: clean or squeak?) · c4 from G · c5 from G# · c6 from A · c7 from Bb. airGap<0.35 each. REFUSAL BEAT on any squeak: "The fingers were never the problem. Keep the air moving through the change."
Phase D: d1-twelfth-reveal (hold C4, add reg -> G5; +19 semitones = octave+fifth, 3rd harmonic, cylindrical bore; predict first) · d2-same-grip (clarion notes light the SAME diagram as twin = note-19)
Phase E: e1-low-notes (F3,E3; predict: harder or relax? relax wins) · e2-pinky-alt (in song context only)
Articulation (last): art1-air-stays (rms envelope drawn live; huffer vs clean notches; >=6 tongued notes with gapRMS >= 0.4*bodyRMS)
Completing a lesson -> markNoteMastered(notes), state.lessons[id].done. Soft gates: ladder orders suggestions only.

## 2. Note drill
Pool = mastered notes; range picker All / below break / over break / current phase. Weight w(m)=1+rtMs/1000+2*misses (EMA rtMs alpha=0.3). Window = max(1.2, 3.0 - 0.12*streak). Expiry -> fingering reveal (clarion reveal names chalumeau twin "= D4 + register key"), miss++, streak 0. Fluent (<=1.5s x3) halves weight. Best streak = state.drill.bestStreak.

## 3. Long tones
Default mid register. Bands +-20/10/5 = Bronze/Silver/Gold (amplitude CoV <=0.25/0.18/0.12). Valid sustain >=4s, wobble over stable middle. Cap: 4 min or 10 sustains -> mentor "rest your lip" nudge. Trend = per-day MIN wobble, descending line toward 5c goal line; per-register bests.

## 4. Interlock
Song rows list written notes; "playable now" when all mastered, else recommended-level badge + which phase unlocks. First-session tune: 3-note micro-tune (A4-G4-F4, Merrily-style) after a3. Lesson payoffs: Phase A -> micro-tune; Phase C -> rung-2 tune; Phase D -> rung-3. Review "drill this grip" jumps to Note Drill filtered to that note.

## 5. Echo + klezmer
Plain echo (2-4 note fragments from mastered notes, pitch-sequence match). Klezmer: sing-first optional (contour only, lenient) -> play back. D freygish written (62,63,66,67,69,70,72,74); fragments around Eb->F# aug-2nd: D-Eb-D · D-Eb-F#-Eb-D · F#-G-A-G-F# · A-Bb-A. Ornament order: slide (scoop) -> trill (>=4 alternations/1.5s) -> krekht (<=120ms higher blip then main) -> dreydl (turn via noteons). Bulgar rhythm 3+3+2.

## 6. Verdicts (moderate strictness)
Per-note: right=1.0 · out-of-tune(|cents|>25)=0.6 · late=0.7 · wrong=0.0; score=mean.
Bands (0..5, see EXPERIENCE-DESIGN): 1 <0.60? use experience doc: 1: 0.60-0.72 "I endured it." · 2: 0.72-0.83 "Tolerable." · 3: 0.83-0.91 "Hm. Not bad." · 4: 0.91-0.97 "There's a musician in there." · 5: >=0.97 + median|cents|<=20 + <=1 wrong "That was music." Below 0.60 = failed gate, no verdict, ratchet-up only.

Build order: helpers+Phase C first, then twelfth reveal + drill, long tones, Phase A/B, first-session tune, echo/klezmer last.
