/* sounds.js – Sound effects + background piano music */

/* Soft piano loop – seamless background music. Replace with assets/piano-loop.mp3 for a local file. */
const PIANO_LOOP_URL = 'https://www.orangefreesounds.com/wp-content/uploads/2015/01/Piano-loop-120-bpm.mp3';
const PIANO_LOOP_FALLBACK = 'assets/piano-loop.mp3';

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

const BackgroundMusic = {
  audio: null,
  started: false,
  _triedFallback: false,

  init() {
    if (this.audio) return;
    try {
      this.audio = new Audio(PIANO_LOOP_URL);
      this.audio.loop = true;
      this.audio.volume = 0.2;
      this.audio.preload = 'auto';
      const self = this;
      this.audio.addEventListener('error', function onError() {
        self.audio.removeEventListener('error', onError);
        if (!self._triedFallback) {
          self._triedFallback = true;
          self.audio = new Audio(PIANO_LOOP_FALLBACK);
          self.audio.loop = true;
          self.audio.volume = 0.2;
          self.audio.preload = 'auto';
        }
      });
    } catch (e) {
      console.warn('BackgroundMusic: init failed', e);
    }
  },

  play() {
    this.init();
    if (!this.audio) return;
    this.audio.volume = 0.2;
    this.audio.play().then(() => { this.started = true; }).catch(() => {});
  },

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  },

  setVolume(v) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, v));
  }
};

if (typeof window !== 'undefined') {
  window.Sounds = Sounds;
  window.BackgroundMusic = BackgroundMusic;
}
