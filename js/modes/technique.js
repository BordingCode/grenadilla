// Technique library — embouchure, breath, tonguing, reed care, squeak rescue.
// Illustrated guides, content grounded in the researched pedagogy doc.
import { showReg } from '../mentor/reg.js';

const emb = `<svg viewBox="0 0 300 170" width="260"><g stroke="#8a6a38" fill="none" stroke-width="2.5">
  <path d="M 40 40 C 90 8 210 8 260 40 L 260 60 C 250 100 220 130 150 138 C 80 130 50 100 40 60 Z" fill="#b98b6322"/>
  <rect x="118" y="86" width="64" height="9" rx="4" fill="#0d0906" stroke="#241811"/>
  <path d="M 118 90 L 84 100" stroke="#0d0906" stroke-width="7"/>
  <path d="M 128 80 C 140 74 160 74 172 80" stroke="#c9974a" stroke-width="3"/>
  <path d="M 126 100 C 140 108 160 108 174 100" stroke="#c9974a" stroke-width="3"/>
  <text x="196" y="78" fill="#b8a98f" font-size="11" stroke="none">top teeth ON</text>
  <text x="196" y="112" fill="#b8a98f" font-size="11" stroke="none">lip cushion, no bite</text>
  <text x="46" y="150" fill="#b8a98f" font-size="11" stroke="none">~⅓ of the mouthpiece in; corners firm ("eee"); flat chin</text>
</g></svg>`;

const breath = `<svg viewBox="0 0 300 170" width="260"><g stroke="#8a6a38" fill="none" stroke-width="2.5">
  <ellipse cx="90" cy="60" rx="34" ry="44" fill="#b98b6322"/>
  <path d="M 90 104 C 88 128 92 144 90 160" />
  <ellipse cx="90" cy="128" rx="22" ry="16" stroke="#c9974a" stroke-width="3"/>
  <path d="M 140 128 C 180 128 200 120 236 100" stroke="#c9974a" stroke-width="4" marker-end="none"/>
  <path d="M 228 108 L 240 98 L 226 94" stroke="#c9974a" stroke-width="3"/>
  <text x="126" y="152" fill="#b8a98f" font-size="11" stroke="none">support from HERE — abdomen, not jaw</text>
  <text x="180" y="86" fill="#b8a98f" font-size="11" stroke="none">fast, steady stream</text>
</g></svg>`;

const GUIDES = [
  {
    id: 'squeak', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><path d="M12 3 L22 20 L2 20 Z"/><path d="M12 9 L12 14 M12 16.8 L12 17"/></svg>`, title: 'Squeak rescue',
    intro: 'The squeak triage — three causes, three tests.',
    body: `
<p><b>The instinct that makes it worse:</b> you squeak, so you bite harder. Biting chokes the reed and guarantees the next squeak. The fix is the opposite: <b>relax the jaw, firm the corners, blow FASTER air.</b></p>
<p><b>Triage — find your cause:</b></p>
<ul>
<li><b>Squeaks change when you swap reeds?</b> → It's the reed. Chipped, warped, or too hard. Beginners: strength 2.0–2.5, never harder "to sound advanced".</li>
<li><b>Squeaks follow certain NOTES?</b> → A leak. Usually the ring fingers not fully covering the big holes. Check in a mirror — press flat, fingertip pads, not tips.</li>
<li><b>Squeaks follow how you PLAY?</b> → Technique: biting, too much mouthpiece, or air that stops and restarts. One-third of the mouthpiece, steady air.</li>
</ul>
<p>Everyone squeaks. Stop apologising to it and blow through.</p>`,
  },
  {
    id: 'embouchure', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><path d="M3 12 C7 8 9 9 12 10.5 C15 9 17 8 21 12 C17 16 15 16.5 12 16.5 C9 16.5 7 16 3 12 Z"/></svg>`, title: 'Embouchure', svg: emb,
    intro: 'Firm but relaxed — the cushion, not the clamp.',
    body: `
<ul>
<li>Top teeth rest ON the mouthpiece (a patch helps). About <b>one-third</b> of the mouthpiece in.</li>
<li>Lower lip is a <b>cushion</b> over the bottom teeth — never a clamp.</li>
<li>Corners of the mouth <b>in and firm</b> (say "eee"), chin flat and pointed.</li>
<li>Cheeks firm, never puffed.</li>
<li>The sound is controlled by <b>air speed</b>, not jaw pressure. When in doubt: more air, less jaw.</li>
</ul>
<p>Embouchure stamina takes months. Tired lip = stop; a tired embouchure practices mistakes.</p>`,
  },
  {
    id: 'breath', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><path d="M3 9 L14 9 C18 9 18 4.5 14.5 4.5 M3 14 L18 14 C22 14 22 19 18 19 M3 4.5 L9 4.5"/></svg>`, title: 'Breath support', svg: breath,
    intro: 'The invisible cause behind almost everything.',
    body: `
<ul>
<li>Breathe low — the belly moves out, shoulders stay down.</li>
<li>Blow a <b>fast, continuous</b> stream, as if keeping a candle flame bent across the room.</li>
<li>Squeaks at the break, thin throat tones, flat low notes: nine times in ten the air dropped out.</li>
<li>Higher notes need <b>faster</b> air — not a tighter bite.</li>
</ul>
<p>Long tones (in the Tone menu) are how this is built. A few minutes daily beats an hour on Sunday.</p>`,
  },
  {
    id: 'tonguing', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><path d="M4 8 L20 8 M6 8 C6 14 8.5 17.5 12 17.5 C15.5 17.5 18 14 18 8"/><path d="M12 17.5 L12 12"/></svg>`, title: 'Tonguing',
    intro: 'The tongue interrupts the reed. The air never stops.',
    body: `
<ul>
<li>Tip of the tongue to the tip of the reed — lightly, "tee" or a soft "dee".</li>
<li>The air column keeps flowing the whole time; the tongue is a valve, not a bellows.</li>
<li><b>Huffing</b> (separating notes with breath pushes) is the classic error — the Air Never Stops lesson will show you your own envelope.</li>
<li>Keep the tongue high and light; heavy "tah" drops the tongue and spreads the tone.</li>
</ul>`,
  },
  {
    id: 'reed', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><rect x="10" y="3" width="4" height="18" rx="2"/><path d="M10 8 L14 8 M10 13 L14 13"/></svg>`, title: 'Reed care',
    intro: 'The reed is the voice. Treat it like one.',
    body: `
<ul>
<li>Beginner strength: <b>2.0–2.5</b>. A harder reed does not make you advanced — it makes you bite.</li>
<li>Moisten before playing (a minute in the mouth). Never play a dry reed.</li>
<li>Rotate 3–4 reeds; a reed lasts weeks, not forever. Chipped = binned.</li>
<li>Store flat on glass or in a reed case, never loose in the case.</li>
<li>Sudden squeaks after weeks of none? Try a fresh reed before blaming yourself.</li>
</ul>`,
  },
  {
    id: 'throat', icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9974a" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="9" r="5.5"/><path d="M12 14.5 C11 17 13 17 12 21"/></svg>`, title: 'Throat tones',
    intro: 'The weakest notes on the instrument — by design.',
    body: `
<ul>
<li>Open G, G♯, A, B♭ are the clarinet's acoustically weakest notes: naturally thin, often flat. <b>That is the instrument, not you.</b></li>
<li>Fix: keep the air generous — and add <b>resonance fingerings</b>: put right-hand fingers down while playing them. Fatter tone, better pitch.</li>
<li>Bonus: with the right hand already down, crossing the break becomes a small move instead of a leap.</li>
</ul>`,
  },
];

export function register({ registerScreen }) {
  registerScreen('technique', { title: 'Technique', init, cleanup: () => {} });
}

function init() {
  const el = document.getElementById('screen-technique');
  el.innerHTML = `
    <div style="flex:1;overflow-y:auto;padding:16px 22px 30px">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;max-width:1000px;margin:0 auto" id="tq-grid">
        ${GUIDES.map((g) => `
          <button class="menu-card" data-guide="${g.id}">
            <span class="icon">${g.icon}</span><span class="name">${g.title}</span>
            <span class="desc">${g.intro}</span>
          </button>`).join('')}
      </div>
      <div id="tq-detail" style="display:none;max-width:760px;margin:0 auto">
        <button class="btn ghost" id="tq-back" style="margin-bottom:14px">‹ All guides</button>
        <div class="panel" id="tq-content" style="line-height:1.65;font-size:16px"></div>
      </div>
    </div>`;

  const grid = document.getElementById('tq-grid');
  const detail = document.getElementById('tq-detail');
  el.querySelectorAll('[data-guide]').forEach((b) =>
    b.addEventListener('click', () => {
      const g = GUIDES.find((x) => x.id === b.dataset.guide);
      grid.style.display = 'none';
      detail.style.display = 'block';
      document.getElementById('tq-content').innerHTML = `
        <h2 style="font-family:var(--serif);color:var(--brass-bright);margin-bottom:8px">${g.title}</h2>
        ${g.svg ? `<div style="text-align:center;margin:10px 0">${g.svg}</div>` : ''}
        <div style="color:var(--cream)">${g.body}</div>`;
      if (Math.random() < 0.25) showReg({ context: 'technique' });
    }));
  document.getElementById('tq-back').addEventListener('click', () => {
    detail.style.display = 'none';
    grid.style.display = 'grid';
  });
}
