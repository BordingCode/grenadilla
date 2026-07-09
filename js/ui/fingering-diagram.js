// SVG clarinet fingering diagram — a stylized vertical Boehm clarinet.
// Filled brass = pressed/covered; outline = open.
import { fingeringFor } from '../data/fingerings.js';

const PRESSED = '#e8b96a';
const OPEN = 'none';
const STROKE = '#8a6a38';
const LABEL = '#b8a98f';

export function fingeringSVG(writtenMidi, { width = 150 } = {}) {
  const f = fingeringFor(writtenMidi);
  if (!f) return '<svg></svg>';
  const has = (k) => f.keys.includes(k);
  const hole = (cx, cy, key, label = '') => `
    <circle cx="${cx}" cy="${cy}" r="13" fill="${has(key) ? PRESSED : OPEN}"
      stroke="${STROKE}" stroke-width="2.5"/>
    ${label ? `<text x="${cx + 22}" y="${cy + 4}" font-size="11" fill="${LABEL}">${label}</text>` : ''}`;
  const pill = (x, y, w, h, key, label) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"
      fill="${has(key) ? PRESSED : OPEN}" stroke="${STROKE}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + h + 12}" font-size="9.5" fill="${LABEL}" text-anchor="middle">${label}</text>`;

  // Layout: body line down the middle; thumb+register on the left rail;
  // throat keys top-right; pinky clusters bottom.
  return `<svg viewBox="0 0 220 560" width="${width}" style="max-width:100%">
    <!-- body -->
    <rect x="92" y="20" width="36" height="470" rx="16" fill="#1c130d" stroke="#4a3626" stroke-width="2"/>
    <ellipse cx="110" cy="510" rx="42" ry="22" fill="#1c130d" stroke="#4a3626" stroke-width="2"/>
    <rect x="98" y="6" width="24" height="20" rx="5" fill="#241811" stroke="#4a3626" stroke-width="2"/>

    <!-- thumb (back of instrument, drawn on left rail) -->
    ${hole(38, 120, 'T')}
    <text x="38" y="94" font-size="10.5" fill="${LABEL}" text-anchor="middle">thumb</text>
    ${pill(22, 148, 32, 14, 'reg', 'reg.')}

    <!-- throat keys (top right) -->
    ${pill(150, 62, 34, 14, 'thA', 'A')}
    ${pill(156, 96, 30, 14, 'thGs', 'G#')}

    <!-- left hand holes -->
    ${hole(110, 130, 'l1', 'L1')}
    ${hole(110, 175, 'l2', 'L2')}
    ${hole(110, 220, 'l3', 'L3')}

    <!-- right hand holes -->
    ${hole(110, 300, 'r1', 'R1')}
    ${hole(110, 345, 'r2', 'R2')}
    ${hole(110, 390, 'r3', 'R3')}

    <!-- left pinky cluster -->
    ${pill(14, 258, 34, 13, 'lCs', 'C#/G#')}
    ${pill(14, 288, 34, 13, 'lFs', 'F#/C#')}
    ${pill(14, 318, 34, 13, 'lE', 'E/B')}
    <text x="31" y="250" font-size="9" fill="${LABEL}" text-anchor="middle">left pinky</text>

    <!-- right pinky cluster -->
    ${pill(170, 402, 34, 13, 'rAb', 'Ab/Eb')}
    ${pill(170, 432, 34, 13, 'rF', 'F/C')}
    ${pill(170, 462, 34, 13, 'rFs', 'F#/C#')}
    ${pill(170, 372, 34, 13, 'rE', 'E/B')}
    <text x="187" y="364" font-size="9" fill="${LABEL}" text-anchor="middle">right pinky</text>
  </svg>`;
}
