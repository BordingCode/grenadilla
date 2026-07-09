// Recordings — one-tap record/playback + saved milestone takes (IndexedDB).
// Hearing yourself from the outside is the best tone teacher there is.
import { mic } from '../pitch/mic.js';
import { state, save } from '../state.js';

let recorder = null;
let chunks = [];
let currentAudio = null;

const DB_NAME = 'grenadilla-recordings';
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('takes', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function putTake(id, blob) {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction('takes', 'readwrite');
    tx.objectStore('takes').put({ id, blob });
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function getTake(id) {
  const d = await db();
  return new Promise((res) => {
    const req = d.transaction('takes').objectStore('takes').get(id);
    req.onsuccess = () => res(req.result && req.result.blob);
    req.onerror = () => res(null);
  });
}
async function delTake(id) {
  const d = await db();
  d.transaction('takes', 'readwrite').objectStore('takes').delete(id);
}

export function register({ registerScreen, toast }) {
  registerScreen('recordings', { title: 'Recordings', needsMic: true, init: () => init(toast), cleanup });
}

function fmtDay(iso) { return iso; }

function init(toast) {
  const el = document.getElementById('screen-recordings');
  const list = () => `
    ${state.recordings.length === 0 ? '<p class="hint">No takes yet. Record one — future you will want to hear how present you sounded.</p>' : ''}
    ${state.recordings.slice().reverse().map((r) => `
      <div class="panel" style="display:flex;align-items:center;gap:14px;padding:12px 16px">
        <button class="btn ghost rec-play" data-id="${r.id}" style="min-width:52px">▶</button>
        <div style="flex:1"><b>${r.label}</b><div class="hint" style="text-align:left">${fmtDay(r.day)}</div></div>
        <button class="btn ghost rec-del" data-id="${r.id}">✕</button>
      </div>`).join('')}`;

  el.innerHTML = `
    <div style="flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:14px;max-width:640px;margin:0 auto;width:100%">
      <div style="display:flex;gap:12px;justify-content:center;align-items:center">
        <button class="btn big" id="rec-btn">⏺ Record</button>
        <span class="label-sm" id="rec-status"></span>
      </div>
      <div id="rec-list">${list()}</div>
    </div>`;

  const btn = document.getElementById('rec-btn');
  const status = document.getElementById('rec-status');

  function refresh() {
    document.getElementById('rec-list').innerHTML = list();
    wire();
  }
  function wire() {
    el.querySelectorAll('.rec-play').forEach((b) => b.addEventListener('click', async () => {
      const blob = await getTake(b.dataset.id);
      if (!blob) return toast('That take’s audio is missing.');
      if (currentAudio) currentAudio.pause();
      currentAudio = new Audio(URL.createObjectURL(blob));
      currentAudio.play();
    }));
    el.querySelectorAll('.rec-del').forEach((b) => b.addEventListener('click', () => {
      delTake(b.dataset.id);
      state.recordings = state.recordings.filter((r) => r.id !== b.dataset.id);
      save();
      refresh();
    }));
  }
  wire();

  btn.addEventListener('click', async () => {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }
    if (!mic.stream) {
      const ok = await mic.start();
      if (!ok) return toast('The microphone isn’t available.');
    }
    chunks = [];
    recorder = new MediaRecorder(mic.stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const id = 'take-' + Date.now();
      await putTake(id, blob);
      state.recordings.push({ id, day: new Date().toISOString().slice(0, 10), label: `Take · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` });
      if (state.recordings.length > 60) { const old = state.recordings.shift(); delTake(old.id); }
      save();
      btn.textContent = '⏺ Record';
      status.textContent = 'saved.';
      refresh();
    };
    recorder.start();
    btn.textContent = '⏹ Stop';
    status.textContent = 'recording…';
  });
}

function cleanup() {
  if (recorder && recorder.state === 'recording') recorder.stop();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
}
