// Free play — live note HUD: name, fingering, intonation. No task, no judgment.
import { mic } from '../pitch/mic.js';
import { midiToPitchClass, midiToName, registerOf } from '../pitch/notes.js';
import { fingeringSVG } from '../ui/fingering-diagram.js';
import { markNoteSeen } from '../state.js';

let onFrame = null;
let lastShown = null;
let holdTimer = 0;

export function register({ registerScreen }) {
  registerScreen('freeplay', { title: 'Free play', needsMic: true, init, cleanup });
}

function init() {
  const el = document.getElementById('screen-freeplay');
  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:5vw;padding:12px 20px;">
      <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;">
        <div class="label-sm">fingering</div>
        <div id="fp-fingering" style="opacity:0.35;transition:opacity 0.25s"></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2vh;min-width:0;">
        <div class="big-note" id="fp-note">—</div>
        <div class="label-sm" id="fp-register">&nbsp;</div>
        <div class="cents-meter">
          <div class="cents-track">
            <div class="center-line"></div>
            <div class="cents-needle" id="fp-needle"></div>
          </div>
          <div class="cents-labels"><span>flat −50</span><span>in tune</span><span>+50 sharp</span></div>
        </div>
        <p class="hint">Play anything. No one is judging. (He isn't even here.)</p>
      </div>
    </div>`;

  const noteEl = document.getElementById('fp-note');
  const regEl = document.getElementById('fp-register');
  const needle = document.getElementById('fp-needle');
  const fingEl = document.getElementById('fp-fingering');
  lastShown = null;

  onFrame = (e) => {
    const { written, cents } = e.detail;
    if (written !== null) {
      clearTimeout(holdTimer);
      if (written !== lastShown) {
        lastShown = written;
        const name = midiToPitchClass(written);
        const oct = midiToName(written).replace(/^[A-G][b#]?/, '');
        noteEl.innerHTML = `${name}<span class="oct">${oct}</span>`;
        regEl.textContent = registerOf(written) + ' register';
        fingEl.innerHTML = fingeringSVG(written, { width: 130 });
        fingEl.style.opacity = '1';
        markNoteSeen(written);
      }
      needle.style.left = `${50 + Math.max(-50, Math.min(50, cents))}%`;
      needle.classList.toggle('in-tune', Math.abs(cents) <= 10);
    } else if (lastShown !== null) {
      // hold the last note briefly so the display doesn't flicker between notes
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        lastShown = null;
        noteEl.textContent = '—';
        regEl.innerHTML = '&nbsp;';
        needle.classList.remove('in-tune');
        fingEl.style.opacity = '0.35';
      }, 900);
    }
  };
  mic.addEventListener('frame', onFrame);
}

function cleanup() {
  if (onFrame) mic.removeEventListener('frame', onFrame);
  onFrame = null;
  clearTimeout(holdTimer);
}
