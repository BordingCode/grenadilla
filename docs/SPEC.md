# Clarinet Learning App — The Prompt

## Context

Mathias is learning the clarinet (adult beginner, can make a sound, doesn't know fingerings or songs yet) and wants an app to learn with. This plan is the deliverable he asked for: a complete, ready-to-use prompt distilled from 15 rounds of Q&A, capturing every decision so a build session can start with zero ambiguity.

**How to use it:** approve this plan and say whether to start building now, or save the prompt and fire it in a fresh session later. The prompt below is self-contained either way.

---

## The Prompt

> **Build me a clarinet learning app.** I'm an adult beginner: I can get a sound out of my clarinet (a standard Boehm-system Bb clarinet) but I don't know fingerings or songs yet. This is a **private project** → `~/cc/`, BordingCode GitHub, live on GitHub Pages, added to Bording Hub, hub-stats snippet included.
>
> **Before designing anything:** read the gamedev knowledge base (`~/cc/gamedev-kb/INDEX.md`), then send the **curriculum-researcher** agent to study real clarinet pedagogy — how beginners actually progress, the proven teaching order (chalumeau register first, when and how to cross "the break"), and the classic failure modes (biting, squeaking, weak breath support) — and write a cited doc into the KB. The lesson ladder must follow that research. Use the learning-designer and game-designer agents for the teaching/experience design, science-checker to verify every fingering chart and song arrangement (musical accuracy is a point of pride), playtester + deploy-verifier before telling me anything is done.
>
> ### Platform & form
> - Vanilla HTML/CSS/JS PWA, no bundler. **iPad in landscape on a stand ~1 m away, my hands on the instrument** — big type, big touch targets, readable at distance, works offline, installable. Use `100svh`, `.nojekyll`, SW-cache `?v=` bump discipline.
> - **All UI text in English.** International note names (B/Bb — not H). Notes named in **clarinet-written pitch** (I play written C, the app says "C"), with a settings toggle for concert pitch. Tuner reference A=440 default, adjustable 438–445.
>
> ### The core: it listens
> Microphone pitch detection (Web Audio) is the heart of the app. It hears what note I play, how in tune, and how steady. Everything below builds on it.
>
> ### Modes
> 1. **Lessons** — fingerings & tone, in research-backed order. Clear SVG fingering diagrams (Boehm).
> 2. **Songbook (~15 songs at launch, quality over quantity)** — a difficulty ladder from 3-note tunes to real pieces. **Copyright-free only**: classical, Danish traditional songs (titles stay in Danish), pre-1929 jazz/swing, folk. **Klezmer as a full category**: traditional freylekhs/bulgars, the freygish scale as an exercise, and ornament lessons (trills, bends, the crying *krekhts*) once basics are solid. Builder picks a **summit piece** the whole ladder climbs toward (candidates: Rhapsody in Blue opening, Mozart Clarinet Concerto Adagio — both public domain), based on what the research says is realistic.
> 3. **Note drill** — the app names a note; **play it within 3 seconds or the fingering appears**. Counts how many in a row I manage without the fingering showing; the window tightens as the streak grows; best streak is the score to beat. Pool defaults to notes I've learned (weighted toward my slow ones), with a range picker (e.g. "over the break only").
> 4. **Free play** — live note HUD: what I'm playing right now, its fingering, how in tune. No task, no judgment.
> 5. **Exercises** — mic-verified scales, interval jumps, and a long-tone trainer (hold a note; see how steady the pitch is).
> 6. **Echo mode** — the app plays a short phrase, I play it back by ear. No notation.
> 7. **Sight-reading generator** — endless random short melodies at my level.
> 8. **Duet mode** — on some songs the app plays a second clarinet line in harmony with me.
> 9. **Tools** — tuner and metronome.
> 10. **Technique library** — illustrated (SVG, no video) guides: embouchure, breath support, tonguing, reed care, squeak troubleshooting.
> 11. **Recording** — one-tap record/playback, plus saved milestone recordings so I can hear my progress month over month.
>
> ### Songs: how playing works
> - **Real notation, rendered big**, auto-scrolling, fingering hints on demand.
> - Practice mode (metronome, tempo control, slow it down) and performance mode with **backing accompaniment styled per song** — jazz trio feel for swing/klezmer, warm piano for classical/Danish. Synthesized in the browser; all audio pleasant and musical (soft envelopes, warm tones — never harsh).
> - After an attempt: **marked-up score review** — every note coloured (right / wrong / out of tune / late) plus the mentor's verdict.
> - **Moderate strictness** to pass: most notes right, roughly in time — honest about what to fix, but no perfection demanded.
> - **Soft gates**: nothing is locked. Songs show difficulty; ones above my level are marked so, not barred.
> - **I choose freely** what to practice — a clear menu, no auto-generated daily session.
>
> ### The mentor (the app's voice)
> An **old jazz clarinetist — a British curmudgeon, properly grumpy and genuinely hard to impress**. The comedy is how unimpressed he is; when he finally approves, it lands. **Absolutely no gushing enthusiasm anywhere in the app** — no "AMAZING! 🎉", ever.
> - **Illustrated SVG character, animated as a living character**: idle breathing and blinking, listens while I play (head tilt, foot tapping to the beat), and distinct reactions — the eyebrow raise, the slow head shake, the rare grudging nod. Silent — text and animation only, no voice audio.
> - Appears at **moments only**: after song attempts, at milestones, occasionally in the technique library. The rest of the app stays clean and quiet.
> - **Song mastery is his verdict**, not stars: each song carries his highest judgment so far, e.g. *"Endured it" → "Tolerable" → "Hm. Not bad." → "That was music."*
>
> ### Progress & data
> - Stats I care about: a **clarinet-range map** filling in as I master notes (crossing the break is a visible landmark), and a **tone-quality trend** from long-tone steadiness over weeks. Skip streaks/minutes counters.
> - Progress lives locally on the iPad with a simple **export/import backup file**. No accounts, no server.
>
> ### Look & feel
> Warm & cozy — wood, brass, warm dark tones; a jazz club / instrument workshop. Before building, **propose 5 names** for me to pick from.
>
> ### Build & verification rules
> - **Fuller first cut**: don't show me a thin core — songbook, note drill, mentor, and stats should all be in before I first try it. Still work in internally verified milestones with commit+push after every change.
> - Mic features must be genuinely tested: synthesize clarinet-like tones into the pitch detector headlessly, and playtest in a real browser (Playwright) with screenshots. The **final feel test on my physical iPad with the real clarinet is mine** — tell me exactly what to try.
> - Nothing may cost money. Verify the deploy is actually live before saying it's done.

---

## What approval means

The prompt above is finished. On approval I'll either **start executing it immediately** (research → design → build → verify → live on GitHub Pages) or, if Mathias prefers, just leave the prompt here to be pasted into a fresh session — his call in the approval message.
