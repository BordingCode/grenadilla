# Grenadilla — Experience Design
(Produced by the game-designer agent. North star: the app is QUIET until it isn't. The whole emotional economy is one grumpy man's approval, spent rarely.)

## Axioms
1. The reward is his verdict, not points. 2. Warm to look at, honest about failure — stakes in systems, warmth in motion (ease-out settle, warm glows, NO confetti/shake/flash). 3. Restraint is the mechanic — Reg appears at moments only. 4. Perfect-information failure — the marked-up score, never a vague "no".

## The mentor: REG BLACKWOOD
Reginald Blackwood — named after the wood the clarinet is turned from (grenadilla = African blackwood). Soho trad-jazz clubs from the late 1950s. British, dry, economical with praise. Grumpy about the WORLD, exacting about the MUSIC, never contemptuous of effort. SILENT — text + animation only. Verdict plaques sign "— Blackwood".

### Verdict ladder (state.songs[id].verdict 0..5, RATCHET UP ONLY; failed gate sets nothing)
0 unheard · 1 "I endured it." (0.60–0.72) · 2 "Tolerable." (0.72–0.83) · 3 "Hm. Not bad." (0.83–0.91) · 4 "There's a musician in there." (0.91–0.97) · 5 "That was music." (>=0.97 + in-tune + <=1 wrong; RARE — pairs with the deep nod; if in doubt make it rarer)

### Copy bank (pick randomly per context; no emoji, no gush) — see js/mentor/reg.js COPY object for the full 40 lines. Keystones:
- First meeting: "So. It makes a sound. That's further than most get before they give up."
- Fail: "The notes and the tune had a disagreement and the tune lost. Have it again."
- First break crossing: "…There. You crossed. Chalumeau to clarion, no squeak, no flinch. Most people fight that wall for a month. Welcome to the top half of the instrument."
- Squeak: "That'll be the reed telling you you bit it. Loosen the jaw, keep the air moving. It isn't your fault — it's an instinct. A wrong one."
- Return after days: "Back, are you. The reed's dried out and so, I expect, has the embouchure. Long tones first. No arguments."
- Mozart mastered: "…He wrote that for a dying friend's instrument, you know. And just then, for eight bars, you did it no dishonour. Sit with that. I'll be at the bar."
- Bulgar mastered: "Ha. NOW you're dangerous. That had bend in it, and cry in it, and it danced."
- Both summits: "…You're not soft any more. That's all I'll say. Now go and play something for the pleasure of it."

### SVG rig (js/mentor/reg.js): groups reg-root/spotlight/chair/glass/torso/chest/arm+clarinet/neck/head(origin 50% 92%)/brows/eyes/moustache/mouth/foot(origin heel).
Animations: breath (chest scaleY 3.6s), blink (140ms, random 2.6–6s), listening (head rotate -6deg, foot taps via BeatScheduler.onVisualBeat 120ms), brow raise, slow shake (1.5s, fail), grudging nod (700ms, tiers 1–3), DEEP NOD (1400ms two slow dips + 1px mouth upturn — tier 5 / break / summits ONLY), entrance translateY(46px) 520ms ease-out no bounce. Reduced-motion: static poses, text still delivers.
Position: #reg-stage overlay bottom-left over scrim, ~280px tall; never full-screen; the score stays visible.

## Moments
- First note heard anywhere (~1.5s sustained): dim, note blooms, Reg's first entrance (state.metReg).
- FIRST BREAK CROSSING (marquee, state.brokeTheBreak): lights dim to 0.12 (500ms) -> spotlight warms in (700ms) -> deep nod -> line types in -> range map "THE BREAK" landmark sweeps lit (900ms) -> soft rising-5th stinger -> lights up. ~3.5s, all contrast, no noise.
- Rung unlock: the next SHELF warms (cold->warm light, 600ms). No Reg.
- Mozart summit: deepest dim, longest hold, auto-save milestone recording. Bulgar summit: Reg STANDS, trio tag, doubled foot-tap — joy.
- Endgame (both summits): line #40, everything lit, doorway to Free Play.

## Screens
- Songbook = sheet-music SHELVES (4 rungs), songs as folio spines w/ brass verdict plaques; above-level dimmed "above your level", never barred. Current shelf backing light warm.
- Performance mode = the smoky club: vignette, key-light on score, faint haze drift, Reg silhouette at the bar tapping to the backing; he only listens. Practice mode = lights-on workshop, plain.
- Drill/long tones/exercises = the workshop, zero atmosphere; reflex-tick confirm pitch-varied by streak.
- Range map: vertical E3->C6 strip, notes fill cold->brass; THE BREAK = bright landmark line between 70 and 71; register bands tinted; tone trend line drifting toward "steadier", no numbers-shaming.

## Failure
Marked-up score first (colours stagger in left->right ~30ms/note), gate check second. Fail -> slow head-shake + specific cause line pulled from score data; stored verdict untouched (cost = you didn't climb). Retry: "Again" / "Slower" (tempo drop) / "Fix this bit" (loop worst phrase). Never buzzer/red-flash/shake.

## Risks
Tier-5 deflation (gate hard); Reg overexposure (moments only); SVG rig transform-origins (build idle+blink+one reaction first). Score bands need one real-clarinet calibration session with Mathias.
