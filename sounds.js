// sounds.js - Sound Manager
class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.3;
    this.enabled = true;
    this.loaded = false;
  }

  async loadSounds() {
    // Piano background music - royalty free piano piece
    this.sounds.background = new Audio('https://assets.mixkit.co/music/preview/mixkit-piano-loop-1124.mp3');
    this.sounds.background.loop = true;
    this.sounds.background.volume = this.volume * 0.5;

    // Button click sound
    this.sounds.click = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
    this.sounds.click.volume = this.volume;

    // Page transition sound
    this.sounds.transition = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3');
    this.sounds.transition.volume = this.volume * 0.7;

    // Success sound for interactions
    this.sounds.success = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    this.sounds.success.volume = this.volume;

    // Menu open/close sound
    this.sounds.menu = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arrow-whoosh-1491.mp3');
    this.sounds.menu.volume = this.volume;

    // Typing sound for text animations
    this.sounds.type = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-keyboard-typing-1386.mp3');
    this.sounds.type.volume = this.volume * 0.3;

    this.loaded = true;
    console.log('Sounds loaded successfully');
  }

  play(soundName) {
    if (!this.enabled || !this.loaded || !this.sounds[soundName]) return;
    
    try {
      const sound = this.sounds[soundName].cloneNode();
      sound.volume = soundName === 'background' ? this.volume * 0.5 : this.volume;
      sound.play().catch(e => console.log('Sound play failed:', e));
    } catch (error) {
      console.log('Sound error:', error);
    }
  }

  stop(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].pause();
      this.sounds[soundName].currentTime = 0;
    }
  }

  toggleMute() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    
    if (!this.enabled) {
      Object.values(this.sounds).forEach(sound => {
        if (sound && typeof sound.pause === 'function') {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    }
    
    return this.enabled;
  }

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.volume;
      }
    });
    localStorage.setItem('soundVolume', this.volume);
  }
}

// Initialize sound manager globally
window.soundManager = new SoundManager();

// Load sounds when page is ready
document.addEventListener('DOMContentLoaded', () => {
  window.soundManager.loadSounds();
});