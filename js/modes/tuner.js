// Tuner — is it in tune? No opinions, just cents.
import { mic } from '../pitch/mic.js';
import { midiToPitchClass, midiToName, writtenToSounding, midiToFreq } from '../pitch/notes.js';
import { settings, save } from '../state.js';

let onFrame = null;
let smooth = 0;

export function register({ registerScreen }) {
  registerScreen('tuner', { title: 'Tuner', needsMic: true, init, cleanup });
}

function init() {
  const el = document.getElementById('screen-tuner');
  el.innerHTML = `
    <div class="center-col">
      <div class="big-note" id="tu-note">—</div>
      <div class="label-sm" id="tu-freq">&nbsp;</div>
      <div class="cents-meter">
        <div class="cents-track" style="height:64px;border-radius:32px;">
          <div class="center-line"></div>
          <div class="cents-needle" id="tu-needle" style="width:16px;"></div>
        </div>
        <div class="cents-labels"><span>−50</span><span id="tu-cents">•</span><span>+50</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <span class="label-sm">A =</span>
        <button class="btn ghost" id="tu-down">−</button>
        <span style="font-size:24px;font-family:var(--serif);min-width:64px;text-align:center" id="tu-a4">${settings.a4}</span>
        <button class="btn ghost" id="tu-up">+</button>
        <span class="label-sm">Hz</span>
      </div>
      <p class="hint" id="tu-hint">Play a note and hold it. Names are written pitch for your B♭ clarinet${settings.concertNames ? ' (concert names on — change in Settings)' : ''}.</p>
    </div>`;

  const a4El = document.getElementById('tu-a4');
  document.getElementById('tu-up').addEventListener('click', () => {
    settings.a4 = Math.min(445, settings.a4 + 1); a4El.textContent = settings.a4; save();
  });
  document.getElementById('tu-down').addEventListener('click', () => {
    settings.a4 = Math.max(438, settings.a4 - 1); a4El.textContent = settings.a4; save();
  });

  const noteEl = document.getElementById('tu-note');
  const freqEl = document.getElementById('tu-freq');
  const centsEl = document.getElementById('tu-cents');
  const needle = document.getElementById('tu-needle');
  smooth = 0;

  onFrame = (e) => {
    const { written, cents, freq } = e.detail;
    if (written !== null) {
      const shown = settings.concertNames ? writtenToSounding(written) : written;
      const name = midiToPitchClass(shown);
      const oct = midiToName(shown).replace(/^[A-G][b#]?/, '');
      noteEl.innerHTML = `${name}<span class="oct">${oct}</span>`;
      freqEl.textContent = `${freq.toFixed(1)} Hz sounding`;
      smooth = smooth * 0.6 + cents * 0.4;
      const c = Math.round(smooth);
      centsEl.textContent = (c > 0 ? '+' : '') + c + ' cents';
      needle.style.left = `${50 + Math.max(-50, Math.min(50, smooth))}%`;
      needle.classList.toggle('in-tune', Math.abs(smooth) <= 5);
    }
  };
  mic.addEventListener('frame', onFrame);
}

function cleanup() {
  if (onFrame) mic.removeEventListener('frame', onFrame);
  onFrame = null;
}
