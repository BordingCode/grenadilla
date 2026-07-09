// Settings — tuning, note names, backup.
import { settings, save, exportData, importData } from '../state.js';

export function register({ registerScreen, toast }) {
  registerScreen('settings', { title: 'Settings', init: () => init(toast), cleanup: () => {} });
}

function init(toast) {
  const el = document.getElementById('screen-settings');
  el.innerHTML = `
    <div style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;max-width:620px;margin:0 auto;width:100%">
      <div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div><b>Tuning reference</b><div class="hint" style="text-align:left;margin-top:3px">A = 438–445 Hz. Standard is 440.</div></div>
        <div style="display:flex;align-items:center;gap:10px">
          <button class="btn ghost" id="se-adown">−</button>
          <span id="se-a4" style="font-size:22px;font-family:var(--serif);min-width:52px;text-align:center">${settings.a4}</span>
          <button class="btn ghost" id="se-aup">+</button>
        </div>
      </div>
      <div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div><b>Note names</b><div class="hint" style="text-align:left;margin-top:3px">Written pitch matches your sheet music and fingerings. Concert shows what actually sounds.</div></div>
        <button class="btn ghost" id="se-names">${settings.concertNames ? 'Concert' : 'Written (clarinet)'}</button>
      </div>
      <div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div><b>Backup</b><div class="hint" style="text-align:left;margin-top:3px">Your progress lives only on this device. Export a file now and then.</div></div>
        <div style="display:flex;gap:10px">
          <button class="btn" id="se-export">Export</button>
          <button class="btn ghost" id="se-import">Import</button>
          <input type="file" id="se-file" accept=".json" style="display:none">
        </div>
      </div>
      <p class="hint">Grenadilla · everything stays on this iPad · microphone audio is never recorded or sent anywhere (recordings you make yourself stay here too)</p>
    </div>`;

  const a4El = document.getElementById('se-a4');
  document.getElementById('se-aup').addEventListener('click', () => { settings.a4 = Math.min(445, settings.a4 + 1); a4El.textContent = settings.a4; save(); });
  document.getElementById('se-adown').addEventListener('click', () => { settings.a4 = Math.max(438, settings.a4 - 1); a4El.textContent = settings.a4; save(); });
  document.getElementById('se-names').addEventListener('click', function () {
    settings.concertNames = !settings.concertNames;
    this.textContent = settings.concertNames ? 'Concert' : 'Written (clarinet)';
    save();
  });
  document.getElementById('se-export').addEventListener('click', () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grenadilla-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup exported.');
  });
  const file = document.getElementById('se-file');
  document.getElementById('se-import').addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    if (!file.files[0]) return;
    try {
      importData(await file.files[0].text());
      toast('Backup restored. Reloading…');
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      toast('That file didn’t look like a Grenadilla backup.');
    }
  });
}
