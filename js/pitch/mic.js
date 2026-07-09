// Live microphone → pitch events, in WRITTEN clarinet pitch.
// Emits on window.gren.mic (EventTarget):
//   'frame'   {freq, clarity, rms, written, cents}  every analysis frame (~60/s)
//   'noteon'  {written, cents}   a note confirmed (few stable frames)
//   'noteoff' {written}          the note ended
//   'status'  {state: 'live'|'denied'|'error'|'off'}
//
// Debug/testing: window.__gren.injectTone(writtenMidi|null) bypasses the mic
// and synthesizes frames so Playwright can drive every mode without a clarinet.

import { detectPitch } from './detector.js';
import { freqToNote, soundingToWritten, midiToFreq, writtenToSounding } from './notes.js';
import { getCtx } from '../audio/ctx.js';
import { settings } from '../state.js';

const CONFIRM_FRAMES = 3;   // frames of the same note before noteon
const RELEASE_FRAMES = 6;   // unclear/silent frames before noteoff

class Mic extends EventTarget {
  constructor() {
    super();
    this.state = 'off';
    this.analyser = null;
    this.buf = null;
    this.stream = null;
    this.raf = 0;
    this.current = null;        // confirmed written midi
    this.candidate = null;
    this.candidateCount = 0;
    this.silenceCount = 0;
    this.injected = null;       // debug: written midi to fake
    this.recent = [];           // median smoothing of raw freq
  }

  async start() {
    if (this.state === 'live') return true;
    try {
      // Music-friendly capture: no browser "voice" processing.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = getCtx();
      const src = ctx.createMediaStreamSource(this.stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 4096;
      src.connect(this.analyser);
      this.buf = new Float32Array(this.analyser.fftSize);
      this.state = 'live';
      this._emit('status', { state: 'live' });
      this._loop();
      return true;
    } catch (err) {
      this.state = err && err.name === 'NotAllowedError' ? 'denied' : 'error';
      this._emit('status', { state: this.state });
      return false;
    }
  }

  stop() {
    cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.state = 'off';
    this._endNote();
    this._emit('status', { state: 'off' });
  }

  _emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  _loop() {
    this.raf = requestAnimationFrame(() => this._loop());
    let res;
    if (this.injected !== null) {
      const f = midiToFreq(writtenToSounding(this.injected), settings.a4);
      res = { freq: f * (1 + (Math.random() - 0.5) * 0.001), clarity: 0.95, rms: 0.1 };
    } else if (this.analyser) {
      this.analyser.getFloatTimeDomainData(this.buf);
      res = detectPitch(this.buf, { sampleRate: getCtx().sampleRate });
    } else return;

    let frame = { freq: null, clarity: res.clarity, rms: res.rms, written: null, cents: null };
    if (res.freq && res.clarity > 0.5) {
      // median-of-3 smoothing kills single-frame octave blips
      this.recent.push(res.freq);
      if (this.recent.length > 3) this.recent.shift();
      const sorted = [...this.recent].sort((a, b) => a - b);
      const freq = sorted[Math.floor(sorted.length / 2)];
      const { midi, cents } = freqToNote(freq, settings.a4);
      frame = { freq, clarity: res.clarity, rms: res.rms, written: soundingToWritten(midi), cents };
    } else {
      this.recent.length = 0;
    }
    this._emit('frame', frame);
    this._track(frame);
  }

  _track(frame) {
    if (frame.written !== null) {
      this.silenceCount = 0;
      if (frame.written === this.current) return;
      if (frame.written === this.candidate) {
        this.candidateCount++;
        if (this.candidateCount >= CONFIRM_FRAMES) {
          this._endNote();
          this.current = frame.written;
          this._emit('noteon', { written: frame.written, cents: frame.cents });
        }
      } else {
        this.candidate = frame.written;
        this.candidateCount = 1;
      }
    } else {
      this.candidate = null;
      this.candidateCount = 0;
      if (this.current !== null && ++this.silenceCount >= RELEASE_FRAMES) this._endNote();
    }
  }

  _endNote() {
    if (this.current !== null) {
      this._emit('noteoff', { written: this.current });
      this.current = null;
    }
    this.candidate = null;
    this.candidateCount = 0;
    this.silenceCount = 0;
  }
}

export const mic = new Mic();
