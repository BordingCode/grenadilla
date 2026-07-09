// My Range — the map of notes you own, with THE BREAK as a landmark,
// plus the tone-quality trend (long-tone steadiness over time).
import { state } from '../state.js';
import { midiToPitchClass, midiToName, registerOf, WRITTEN_MIN_MIDI, WRITTEN_MAX_MIDI, BREAK_UPPER_MIDI } from '../pitch/notes.js';

export function register({ registerScreen }) {
  registerScreen('stats', { title: 'My range', init, cleanup: () => {} });
}

const REG_TINT = { chalumeau: 'rgba(201,151,74,0.06)', throat: 'rgba(201,151,74,0.12)', clarion: 'rgba(201,151,74,0.18)' };

function init() {
  const el = document.getElementById('screen-stats');
  const mastered = Object.entries(state.notes).filter(([, r]) => r.mastered).length;
  const total = WRITTEN_MAX_MIDI - WRITTEN_MIN_MIDI + 1;

  let strip = '';
  for (let m = WRITTEN_MAX_MIDI; m >= WRITTEN_MIN_MIDI; m--) {
    const r = state.notes[m];
    const owned = r && r.mastered;
    const seen = r && r.seen;
    const isBreak = m === BREAK_UPPER_MIDI;
    strip += `
      ${isBreak ? `<div style="display:flex;align-items:center;gap:10px;margin:2px 0">
        <div style="flex:1;height:2px;background:linear-gradient(90deg,var(--brass-bright),transparent)"></div>
        <span style="font-size:11px;letter-spacing:0.25em;color:var(--brass-bright)">THE BREAK</span>
        <div style="flex:1;height:2px;background:linear-gradient(270deg,var(--brass-bright),transparent)"></div>
      </div>` : ''}
      <div style="display:flex;align-items:center;gap:10px;padding:1px 0;background:${REG_TINT[registerOf(m)] || 'none'}">
        <span style="width:44px;text-align:right;font-family:var(--serif);font-size:14px;color:${owned ? 'var(--brass-bright)' : seen ? 'var(--cream-dim)' : 'var(--cream-faint)'}">${midiToPitchClass(m)}<span style="font-size:0.75em">${midiToName(m).replace(/^[A-G][b#]?/, '')}</span></span>
        <div style="flex:1;height:13px;border-radius:7px;border:1px solid ${owned ? 'var(--brass)' : 'rgba(201,151,74,0.2)'};
          background:${owned ? 'linear-gradient(90deg,var(--brass-dim),var(--brass-bright))' : seen ? 'rgba(201,151,74,0.15)' : 'transparent'}"></div>
      </div>`;
  }

  // tone trend: per-day minimum wobble
  const byDay = {};
  for (const t of state.toneLog) byDay[t.day] = Math.min(byDay[t.day] ?? Infinity, t.bestWobble);
  const days = Object.keys(byDay).sort();
  const pts = days.map((d) => byDay[d]);

  el.innerHTML = `
    <div style="flex:1;min-height:0;display:flex;gap:26px;padding:14px 26px;max-width:1080px;margin:0 auto;width:100%">
      <div style="flex:1.1;min-height:0;display:flex;flex-direction:column">
        <div class="label-sm" style="margin-bottom:6px">the map — ${mastered} of ${total} notes owned</div>
        <div style="flex:1;overflow-y:auto;padding-right:8px">${strip}</div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:12px">
        <div class="label-sm">tone trend — long-tone steadiness</div>
        <div class="panel" style="flex:0 0 auto">
          ${pts.length < 2
            ? '<p class="hint" style="text-align:left">Do long tones on a few different days and your steadiness line will appear here — drifting, with any luck, downward toward calm.</p>'
            : trendSVG(days, pts)}
        </div>
        <div class="panel">
          <div class="label-sm" style="margin-bottom:8px">bests</div>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:15px">
            <div>Steadiest long tone: <b style="color:var(--brass-bright)">${state.toneLog.length ? '±' + Math.min(...state.toneLog.map((t) => t.bestWobble)).toFixed(1) + '¢' : '—'}</b></div>
            <div>Drill streak record: <b style="color:var(--brass-bright)">${state.drill.bestStreak || '—'}</b></div>
            <div>The break: <b style="color:var(--brass-bright)">${state.brokeTheBreak || state.milestones.brokeTheBreak ? 'crossed' : 'ahead of you'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
}

function trendSVG(days, pts) {
  const w = 420, h = 180, pad = 26;
  const maxY = Math.max(30, ...pts);
  const x = (i) => pad + (i / Math.max(1, pts.length - 1)) * (w - 2 * pad);
  const y = (v) => h - pad - (1 - v / maxY) * -(h - 2 * pad) - (h - 2 * pad);
  const yy = (v) => pad + (v / maxY) * (h - 2 * pad);
  const line = pts.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${yy(v)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
    <line x1="${pad}" y1="${yy(5)}" x2="${w - pad}" y2="${yy(5)}" stroke="var(--good)" stroke-dasharray="4 5" opacity="0.6"/>
    <text x="${w - pad}" y="${yy(5) - 5}" fill="var(--good)" font-size="10" text-anchor="end">±5¢ — the goal</text>
    <path d="${line}" fill="none" stroke="var(--brass-bright)" stroke-width="2.5" stroke-linecap="round"/>
    ${pts.map((v, i) => `<circle cx="${x(i)}" cy="${yy(v)}" r="3.4" fill="var(--brass)"/>`).join('')}
    <text x="${pad}" y="${h - 6}" fill="var(--cream-faint)" font-size="10">${days[0]}</text>
    <text x="${w - pad}" y="${h - 6}" fill="var(--cream-faint)" font-size="10" text-anchor="end">${days[days.length - 1]}</text>
  </svg>`;
}
