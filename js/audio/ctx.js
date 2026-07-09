// Shared lazy AudioContext with a master bus + limiter (never harsh, never clips).
let ctx = null;
let master = null;

export function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.9;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    master.connect(limiter);
    limiter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function getMaster() {
  getCtx();
  return master;
}

// Call from any user gesture to unlock audio on iOS.
export function unlockAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}
