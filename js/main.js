// Entry point: gathers all mode modules and boots the app.
import { boot } from './app.js';
import * as freeplay from './modes/freeplay.js';
import * as tuner from './modes/tuner.js';
import * as metronome from './modes/metronome.js';
import * as longtone from './modes/longtone.js';
import * as drill from './modes/drill.js';
import * as lessons from './modes/lessons.js';
import * as songbook from './modes/songbook.js';
import * as echo from './modes/echo.js';
import * as sightread from './modes/sightread.js';
import * as technique from './modes/technique.js';
import * as stats from './modes/stats.js';
import * as recordings from './modes/recordings.js';
import * as settingsMode from './modes/settings.js';

export function bootApp() {
  boot([
    freeplay, tuner, metronome, longtone, drill, lessons, songbook,
    echo, sightread, technique, stats, recordings, settingsMode,
  ]);
}

export { bootApp as boot };
