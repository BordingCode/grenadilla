// Reg Blackwood — the mentor. Silent; text and animation only.
// Named after the wood the clarinet is turned from. Appears at moments only.
import { state, save } from '../state.js';

export const COPY = {
  firstMeeting: [
    "So. It makes a sound. That's further than most get before they give up.",
    "Reg Blackwood. I listened to better men than you for forty years. I'll listen to you too. Go on.",
  ],
  tier1: [
    "I endured it. Barely. But the notes were, more or less, the ones written.",
    "You got to the end. So did I, and I wasn't even playing. Again — properly this time.",
  ],
  tier2: [
    "Tolerable. I've paid good money to hear worse in nicer rooms.",
    "Tolerable. Don't let it go to your head — there's a long way between this and worth hearing.",
  ],
  tier3: [
    "Hm. Not bad. I'll not pretend I expected that.",
    "Not bad at all. The tone found its feet in the middle there. Do it again before it forgets.",
  ],
  tier4: [
    "There's a musician in there somewhere, fighting the reed. Let him out more often.",
    "Now that — that was nearly played, not just fingered. Close. Annoyingly close.",
  ],
  tier5: [
    "That was music. I'll deny saying it.",
    "…Play that back for yourself sometime. That's the sound you've been chasing. You caught it.",
  ],
  fail: [
    "No. That wasn't it. You know it wasn't — I can see it on your face.",
    "The notes and the tune had a disagreement and the tune lost. Have it again.",
    "Stop. Breathe. The air went before the phrase did. Once more, slower.",
  ],
  breakCrossing: [
    "…There. You crossed. Chalumeau to clarion, no squeak, no flinch. Most people fight that wall for a month. Welcome to the top half of the instrument.",
  ],
  firstMastered: [
    "One tune you can actually play. One. It's a start — and starts are the hard part, so.",
  ],
  firstNoteOwned: [
    "One note, properly held. That's the whole thing in miniature. Now go and get the other thirty.",
  ],
  chalumeauFilled: [
    "The bottom of the horn is yours now. Warm, woody, honest. Don't get comfortable.",
  ],
  fullRange: [
    "Two octaves and change. The whole map lit up. There's nothing on this instrument you can't now at least attempt — which is a different thing from play, mind.",
  ],
  drillRecord: [
    "Faster than last time. The fingers are starting to think for themselves. Good — leaves your brain free for the music.",
    "A new best. Note-to-grip with no dithering. That reflex is worth more than any scale.",
  ],
  longToneBest: [
    "Steadier. The pitch barely wandered. That's what a long tone is for — not to bore you, to train the thing that carries every other note.",
    "Held it, and held it still. Seconds of not fidgeting. The tone thanks you.",
  ],
  squeak: [
    "That'll be the reed telling you you bit it. Loosen the jaw, keep the air moving. It isn't your fault — it's an instinct. A wrong one.",
    "A squeak. Everyone squeaks. The trick is to stop apologising to it and just blow through.",
  ],
  refusalBeat: [
    "The fingers were never the problem. Keep the air moving through the change.",
  ],
  returning: [
    "Back, are you. The reed's dried out and so, I expect, has the embouchure. Long tones first. No arguments.",
    "I wondered. The clarinet didn't — it doesn't miss anyone. Warm up, then we'll see what's left.",
    "A while, that was. Don't try to pick up where you left off; pick up two rungs below and earn it back.",
  ],
  mozartAttempt: [
    "Mozart. The Adagio. There's no hiding on this one — no speed to hide behind, no ornament to distract me. Just tone, and whether you have any. Let's find out.",
  ],
  mozartMastered: [
    "…He wrote that for a dying friend's instrument, you know. And just then, for eight bars, you did it no dishonour. Sit with that. I'll be at the bar.",
  ],
  bulgarAttempt: [
    "Right — now we have some fun. Freygish, a krekht, and no politeness. If it doesn't sound a little like laughing and crying at once, you've played it wrong.",
  ],
  bulgarMastered: [
    "Ha. Now you're dangerous. That had bend in it, and cry in it, and it danced. Forty years and that still gets me out of the chair. Don't tell anyone.",
  ],
  bothSummits: [
    "I've spent this whole time being hard on you because soft teachers make soft players. You're not soft any more. …That's all I'll say. Now go and play something for the pleasure of it.",
  ],
  technique: [
    "Reading about it won't fix it. But since you're here — the answer is always 'more air, less jaw.' It usually is.",
    "Embouchure. Everyone wants the secret. The secret is you do it every day for a year. Sorry.",
  ],
  summitNearMiss: [
    "So close I could taste it. Rest the lip and have it again. You're closer than you think, and I don't say that.",
  ],
};

export const VERDICT_NAMES = ['Unheard', 'I endured it.', 'Tolerable.', 'Hm. Not bad.', "There's a musician in there.", 'That was music.'];

export function pick(context) {
  const lines = COPY[context] || ['…'];
  return lines[Math.floor(Math.random() * lines.length)];
}

// The SVG rig — one scene, named animatable groups (see EXPERIENCE-DESIGN).
export function regSVG() {
  return `<svg id="reg-svg" viewBox="0 0 320 300" width="270" aria-label="Reg Blackwood">
  <g id="reg-root">
    <circle id="reg-spotlight" cx="150" cy="140" r="150" fill="url(#reg-spot-grad)" opacity="0"/>
    <defs>
      <radialGradient id="reg-spot-grad">
        <stop offset="0%" stop-color="rgba(232,185,106,0.35)"/>
        <stop offset="100%" stop-color="rgba(232,185,106,0)"/>
      </radialGradient>
    </defs>
    <!-- chair -->
    <g id="reg-chair">
      <rect x="40" y="120" width="180" height="140" rx="22" fill="#2c1f15" stroke="#4a3626" stroke-width="2"/>
      <rect x="26" y="170" width="42" height="90" rx="18" fill="#33241a" stroke="#4a3626" stroke-width="2"/>
      <rect x="192" y="170" width="42" height="90" rx="18" fill="#33241a" stroke="#4a3626" stroke-width="2"/>
    </g>
    <!-- side table + glass -->
    <g id="reg-glass">
      <rect x="252" y="216" width="54" height="6" rx="3" fill="#4a3626"/>
      <rect x="274" y="222" width="8" height="46" fill="#3a2b1d"/>
      <rect x="262" y="196" width="20" height="20" rx="3" fill="rgba(201,151,74,0.35)" stroke="#8a6a38"/>
      <rect x="263" y="206" width="18" height="9" fill="rgba(201,151,74,0.55)"/>
    </g>
    <!-- torso -->
    <g id="reg-torso">
      <g id="reg-chest">
        <path d="M 88 262 C 84 200 96 168 130 160 L 172 160 C 204 170 214 202 210 262 Z" fill="#2b2016" stroke="#4a3626" stroke-width="2"/>
        <path d="M 130 162 L 148 200 L 166 162 Z" fill="#1c130d"/>
        <path d="M 128 160 L 148 200 L 120 236 L 112 172 Z" fill="#241811"/>
        <path d="M 168 160 L 148 200 L 178 236 L 186 172 Z" fill="#241811"/>
      </g>
    </g>
    <!-- clarinet across lap + right hand -->
    <g id="reg-arm-clar">
      <rect x="92" y="230" width="130" height="10" rx="5" transform="rotate(-11 157 235)" fill="#0d0906" stroke="#241811"/>
      <g id="reg-clar-keys" transform="rotate(-11 157 235)">
        <circle cx="120" cy="235" r="2.6" fill="#e8b96a"/><circle cx="140" cy="235" r="2.6" fill="#e8b96a"/>
        <circle cx="160" cy="235" r="2.6" fill="#e8b96a"/><circle cx="182" cy="235" r="2.6" fill="#c9974a"/>
        <circle cx="126" cy="231" r="1.3" fill="#f0e2cc"/>
      </g>
      <ellipse cx="178" cy="228" rx="13" ry="10" fill="#b98b63"/>
    </g>
    <!-- neck & head -->
    <rect id="reg-neck" x="136" y="140" width="28" height="26" fill="#8f6a49"/>
    <g id="reg-head">
      <ellipse id="reg-skull" cx="150" cy="108" rx="34" ry="38" fill="#b98b63"/>
      <path d="M 116 106 C 114 88 122 70 150 68 C 178 70 186 88 184 106 C 180 92 168 84 150 84 C 132 84 120 92 116 106 Z" fill="#1c130d"/>
      <path d="M 114 104 C 110 112 110 122 114 128 L 120 126 C 117 120 117 110 119 104 Z" fill="#9a927f"/>
      <path d="M 186 104 C 190 112 190 122 186 128 L 180 126 C 183 120 183 110 181 104 Z" fill="#9a927f"/>
      <ellipse id="reg-ear" cx="118" cy="112" rx="6" ry="9" fill="#a97e58"/>
      <g id="reg-face">
        <path id="reg-brows" d="M 128 98 L 146 95 M 156 95 L 174 98" stroke="#9a927f" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <ellipse id="reg-eye-l" cx="137" cy="107" rx="4.5" ry="3.6" fill="#f0e2cc"/>
        <circle cx="138" cy="107.5" r="1.9" fill="#17100b"/>
        <ellipse id="reg-eye-r" cx="163" cy="107" rx="4.5" ry="3.6" fill="#f0e2cc"/>
        <circle cx="164" cy="107.5" r="1.9" fill="#17100b"/>
        <path id="reg-nose" d="M 149 108 C 147 116 145 120 147 123 L 153 123" stroke="#8f6a49" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path id="reg-moustache" d="M 132 130 C 140 124 160 124 168 130 C 160 132 140 132 132 130 Z" fill="#9a927f"/>
        <line id="reg-mouth" x1="141" y1="137" x2="159" y2="137" stroke="#6d4f37" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>
    <!-- foot -->
    <g id="reg-foot">
      <rect x="96" y="268" width="44" height="14" rx="7" fill="#17100b" stroke="#33241a"/>
    </g>
  </g>
</svg>`;
}

let blinkTimer = 0;
let stageEl = null;

function ensureStage() {
  if (!stageEl) {
    stageEl = document.createElement('div');
    stageEl.id = 'reg-stage';
    stageEl.innerHTML = `
      <div id="reg-scrim"></div>
      <div id="reg-holder">
        ${regSVG()}
        <div id="reg-speech"><div id="reg-text"></div><div id="reg-sign">— Blackwood</div></div>
        <button class="btn ghost" id="reg-dismiss">…</button>
      </div>`;
    document.body.appendChild(stageEl);
    stageEl.querySelector('#reg-scrim').addEventListener('click', hideReg);
    stageEl.querySelector('#reg-dismiss').addEventListener('click', hideReg);
  }
  return stageEl;
}

function blinkLoop() {
  clearTimeout(blinkTimer);
  blinkTimer = setTimeout(() => {
    const svg = document.getElementById('reg-svg');
    if (svg) {
      svg.classList.add('blink');
      setTimeout(() => svg.classList.remove('blink'), 150);
    }
    blinkLoop();
  }, 2600 + Math.random() * 3400);
}

// showReg({context, reaction, spotlight, hold}) — mounts Reg, plays a reaction,
// types the line. reaction: 'nod' | 'nod-deep' | 'shake' | 'brow' | null.
export function showReg({ context, line, reaction = null, spotlight = false, sticky = false } = {}) {
  const stage = ensureStage();
  stage.classList.add('show');
  const svg = stage.querySelector('#reg-svg');
  svg.classList.remove('nod', 'nod-deep', 'shake', 'brow', 'listening');
  const root = stage.querySelector('#reg-holder');
  root.classList.add('reg-enter-start');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('reg-enter-start')));
  blinkLoop();

  const spot = stage.querySelector('#reg-spotlight');
  spot.style.transition = 'opacity 0.7s ease-out';
  spot.style.opacity = spotlight ? '1' : '0';

  const text = line || pick(context);
  const textEl = stage.querySelector('#reg-text');
  textEl.textContent = '';
  // unhurried type-in
  let i = 0;
  clearInterval(textEl._t);
  textEl._t = setInterval(() => {
    textEl.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(textEl._t);
  }, 18);

  if (reaction) {
    setTimeout(() => {
      svg.classList.add(reaction);
      if (reaction === 'brow') setTimeout(() => svg.classList.remove('brow'), 1300);
    }, 650);
  }
  if (!sticky) {
    clearTimeout(stage._auto);
    stage._auto = setTimeout(hideReg, Math.max(5200, text.length * 60 + 2500));
  }
  return stage;
}

export function hideReg() {
  if (!stageEl) return;
  clearTimeout(stageEl._auto);
  clearTimeout(blinkTimer);
  const holder = stageEl.querySelector('#reg-holder');
  holder.classList.add('reg-exit');
  setTimeout(() => { stageEl.classList.remove('show'); holder.classList.remove('reg-exit'); }, 400);
}

// First-meeting hook: call when a sustained note is first heard anywhere.
export function maybeFirstMeeting() {
  if (state.metReg) return false;
  state.metReg = true;
  save();
  showReg({ context: 'firstMeeting', reaction: 'brow' });
  return true;
}
