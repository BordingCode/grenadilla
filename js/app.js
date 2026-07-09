// Grenadilla — app boot + screen router.
import { mic } from './pitch/mic.js';
import { unlockAudio } from './audio/ctx.js';
import { state, save } from './state.js';

const screens = {};
let activeScreen = null;
const cleanups = {};   // per-screen cleanup fns
const inits = {};      // per-screen init fns

export function registerScreen(id, { init, cleanup, title, needsMic } = {}) {
  screens[id] = { init, cleanup, title: title || '', needsMic: !!needsMic };
}

export function show(id, params) {
  if (activeScreen && screens[activeScreen] && screens[activeScreen].cleanup) {
    try { screens[activeScreen].cleanup(); } catch (e) { console.error(e); }
  }
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (!el) return;
  el.classList.add('active');
  activeScreen = id;
  const meta = screens[id] || {};
  const topbar = document.getElementById('topbar');
  topbar.classList.toggle('has-back', id !== 'home');
  document.getElementById('screen-title').textContent = meta.title || 'Grenadilla';
  if (meta.needsMic) ensureMic();
  if (meta.init) { try { meta.init(params); } catch (e) { console.error(e); } }
}

export function toast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

// ---- microphone gate ----
async function ensureMic() {
  if (mic.state === 'live') return;
  const gate = document.getElementById('mic-gate');
  gate.classList.add('show');
}

async function requestMic() {
  unlockAudio();
  const ok = await mic.start();
  const gate = document.getElementById('mic-gate');
  if (ok) {
    gate.classList.remove('show');
  } else {
    document.getElementById('mic-gate-msg').textContent =
      mic.state === 'denied'
        ? 'Microphone access was blocked. Allow it in Safari settings (aA icon → Website Settings → Microphone) and try again.'
        : 'Could not open the microphone. Close other apps using it and try again.';
  }
}

mic.addEventListener('status', (e) => {
  const dot = document.getElementById('mic-dot');
  dot.classList.toggle('live', e.detail.state === 'live');
  dot.classList.toggle('err', e.detail.state === 'denied' || e.detail.state === 'error');
});

// ---- boot ----
export async function boot(modeModules) {
  document.getElementById('btn-back').addEventListener('click', () => show('home'));
  document.getElementById('btn-mic-allow').addEventListener('click', requestMic);
  document.getElementById('btn-mic-later').addEventListener('click', () => {
    document.getElementById('mic-gate').classList.remove('show');
  });

  for (const mod of modeModules) {
    try { mod.register({ registerScreen, show, toast }); } catch (e) { console.error('mode failed to register', e); }
  }

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => { unlockAudio(); show(btn.dataset.nav); });
  });

  show('home');
  if (state.firstRun) { state.firstRun = false; save(); }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    // iOS PWA update reliability
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistration().then((r) => r && r.update());
      }
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloaded) { reloaded = true; location.reload(); }
    });
  }
}

// Debug API for tests: drive the pitch pipeline without a clarinet.
window.__gren = {
  injectTone(writtenMidi) { mic.injected = writtenMidi; if (writtenMidi !== null && mic.state !== 'live') { mic.state = 'live'; mic._emit('status', { state: 'live' }); mic._loop(); } },
  mic,
  show,
  state,
};
