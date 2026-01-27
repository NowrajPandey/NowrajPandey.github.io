/* sounds.js – Sound effects (Web Audio API) */

const Sounds = {
  _ctx: null,
  _initialized: false,

  init() {
    if (this._initialized) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._initialized = true;
    } catch (e) {
      console.warn('Sounds: AudioContext not supported', e);
    }
  },

  _ensureContext() {
    if (!this._ctx) this.init();
    if (!this._ctx) return null;
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  },

  _playTone(freq, durationMs, volume = 0.12) {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + durationMs * 0.001);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs * 0.001);
    osc.start(now);
    osc.stop(now + durationMs * 0.001);
  },

  playClick() {
    if (typeof window.soundManager !== 'undefined' && !window.soundManager.enabled) return;
    this._playTone(880, 45, 0.1);
  },

  playSoft() {
    if (typeof window.soundManager !== 'undefined' && !window.soundManager.enabled) return;
    this._playTone(660, 35, 0.08);
  }
};

if (typeof window !== 'undefined') {
  window.Sounds = Sounds;
}
