/* sounds.js - Sound effects manager

/*const Sounds = {
  click: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ'),
  
  init() {
    // Initialize click sound (simple beep)
    this.click.volume = 0.3;
    this.click.preload = 'auto';
  },
  
  playClick() {
    if (window.soundManager && window.soundManager.enabled) {
      this.click.currentTime = 0;
      this.click.play().catch(() => {
        // Silent fail if audio can't play
      });
    }
  }
};

// Initialize sounds
Sounds.init();

// Export to global scope
window.Sounds = Sounds;

