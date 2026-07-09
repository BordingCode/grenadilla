// Metronome — warm click, honest time.
import { BeatScheduler, playClick } from '../audio/synth.js';
import { unlockAudio } from '../audio/ctx.js';

let sched = null;

export function register({ registerScreen }) {
  registerScreen('metronome', { title: 'Metronome', init, cleanup });
}

const TEMPI = [
  [50, 'Largo'], [60, 'Larghetto'], [66, 'Adagio'], [76, 'Andante'],
  [92, 'Moderato'], [108, 'Allegretto'], [120, 'Allegro'], [144, 'Vivace'], [168, 'Presto'],
];

function tempoName(bpm) {
  let name = TEMPI[0][1];
  for (const [b, n] of TEMPI) if (bpm >= b) name = n;
  return name;
}

function init() {
  const el = document.getElementById('screen-metronome');
  el.innerHTML = `
    <div class="center-col">
      <div style="display:flex;gap:10px;" id="me-lights"></div>
      <div class="big-note" id="me-bpm" style="font-size:clamp(70px,16vh,120px)">90</div>
      <div class="label-sm" id="me-name">Moderato</div>
      <input type="range" min="40" max="208" value="90" id="me-slider"
        style="width:min(560px,80vw);accent-color:var(--brass);height:44px;touch-action:none;">
      <div style="display:flex;gap:12px;align-items:center;">
        <button class="btn ghost" id="me-minus">−5</button>
        <span class="label-sm" style="width:110px;text-align:center">beats/bar
          <select id="me-beats" style="font-size:18px;background:var(--wood-warm);color:var(--cream);border:1px solid var(--brass-dim);border-radius:8px;padding:6px 10px;margin-top:4px;display:block;margin-inline:auto;">
            <option>2</option><option>3</option><option selected>4</option><option>6</option>
          </select></span>
        <button class="btn ghost" id="me-plus">+5</button>
      </div>
      <button class="btn big" id="me-toggle">Start</button>
    </div>`;

  let bpm = 90, beats = 4, running = false;
  const bpmEl = document.getElementById('me-bpm');
  const nameEl = document.getElementById('me-name');
  const slider = document.getElementById('me-slider');
  const lights = document.getElementById('me-lights');
  const toggle = document.getElementById('me-toggle');

  function drawLights() {
    lights.innerHTML = Array.from({ length: beats }, (_, i) =>
      `<div class="me-light" data-i="${i}" style="width:18px;height:18px;border-radius:50%;border:2px solid var(--brass-dim);transition:background 0.08s,box-shadow 0.08s;"></div>`).join('');
  }
  function setBpm(v) {
    bpm = Math.max(40, Math.min(208, v));
    bpmEl.textContent = bpm;
    nameEl.textContent = tempoName(bpm);
    slider.value = bpm;
    if (sched) sched.bpm = bpm;
  }
  function stop() {
    running = false;
    if (sched) sched.stop();
    sched = null;
    toggle.textContent = 'Start';
    lights.querySelectorAll('.me-light').forEach((l) => { l.style.background = 'none'; l.style.boxShadow = 'none'; });
  }
  function start() {
    unlockAudio();
    running = true;
    toggle.textContent = 'Stop';
    sched = new BeatScheduler({
      bpm,
      onBeat: (b, t) => playClick(t, { accent: b % beats === 0 }),
      onVisualBeat: (b) => {
        lights.querySelectorAll('.me-light').forEach((l, i) => {
          const on = i === b % beats;
          l.style.background = on ? 'var(--brass-bright)' : 'none';
          l.style.boxShadow = on ? '0 0 12px rgba(232,185,106,0.7)' : 'none';
        });
      },
    });
    sched.start();
  }

  drawLights();
  slider.addEventListener('input', () => setBpm(+slider.value));
  document.getElementById('me-minus').addEventListener('click', () => setBpm(bpm - 5));
  document.getElementById('me-plus').addEventListener('click', () => setBpm(bpm + 5));
  document.getElementById('me-beats').addEventListener('change', (e) => {
    beats = +e.target.value;
    drawLights();
  });
  toggle.addEventListener('click', () => (running ? stop() : start()));
}

function cleanup() {
  if (sched) sched.stop();
  sched = null;
}
