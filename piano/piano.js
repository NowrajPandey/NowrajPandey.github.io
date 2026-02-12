// piano.js - Complete piano using Web Audio API

document.addEventListener("DOMContentLoaded", function () {
  // Audio context
  let audioContext;
  let masterGain;

  // Note frequencies (A4 = 440Hz)
  const noteFrequencies = {
    C: 261.63,
    "C#": 277.18,
    D: 293.66,
    "D#": 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    G: 392.0,
    "G#": 415.3,
    A: 440.0,
    "A#": 466.16,
    B: 493.88,
  };

  // DOM Elements
  const keys = document.querySelectorAll(".key");
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const waveformSelect = document.getElementById("waveform");
  const octaveSelect = document.getElementById("octave");
  const currentNoteEl = document.getElementById("current-note");
  const songButtons = document.querySelectorAll(".song-btn");

  // Slider Elements
  const cards = document.querySelectorAll(".video-card");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  // State
  let activeOscillators = {};
  let currentVolume = 0.7;
  let currentWaveform = "sine";
  let currentOctave = 4;
  let isAudioInitialized = false;

  // Initialize audio context
  function initializeAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = currentVolume;
      isAudioInitialized = true;
      console.log("Audio context initialized");
    }
  }

  // Play note function
  function playNote(note, octave = currentOctave) {
    if (!isAudioInitialized) initializeAudio();

    try {
      // Get base frequency
      let baseFreq = noteFrequencies[note];
      if (!baseFreq) return;

      // Adjust for octave
      let frequency = baseFreq * Math.pow(2, octave - 4);

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      // Set oscillator type and frequency
      oscillator.type = currentWaveform;
      oscillator.frequency.value = frequency;

      // Create envelope
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(currentVolume * 0.7, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      // Start oscillator
      oscillator.start(now);
      oscillator.stop(now + 1.5);

      // Store oscillator
      const id = note + octave + Date.now();
      activeOscillators[id] = { oscillator, gainNode };

      // Remove reference after sound completes
      setTimeout(() => {
        delete activeOscillators[id];
      }, 1500);

      // Update UI
      currentNoteEl.textContent = note + octave;

      // Visual feedback
      const key = document.querySelector(`.key[data-note="${note}"][data-key]`);
      if (key) {
        key.classList.add("active");
        setTimeout(() => {
          if (key.classList.contains("active")) {
            key.classList.remove("active");
          }
        }, 150);
      }

      console.log("Playing:", note + octave, "at", frequency.toFixed(2) + "Hz");
    } catch (error) {
      console.error("Error playing note:", error);
    }
  }

  // Stop all sounds
  function stopAllSounds() {
    Object.values(activeOscillators).forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    activeOscillators = {};
  }

  // Handle key press
  function handleKeyPress(keyElement) {
    const note = keyElement.dataset.note;
    const octave = keyElement.dataset.octave
      ? parseInt(keyElement.dataset.octave)
      : currentOctave;

    if (note) {
      keyElement.classList.add("active");
      playNote(note, octave);
    }
  }

  // Handle key release
  function handleKeyRelease(keyElement) {
    keyElement.classList.remove("active");
  }

  // Initialize piano keys
  function initializeKeys() {
    keys.forEach((key) => {
      // Mouse events
      key.addEventListener("mousedown", (e) => {
        e.preventDefault();
        handleKeyPress(key);
      });

      key.addEventListener("mouseup", () => {
        handleKeyRelease(key);
      });

      key.addEventListener("mouseleave", () => {
        if (key.classList.contains("active")) {
          handleKeyRelease(key);
        }
      });

      // Touch events for mobile
      key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleKeyPress(key);
      });

      key.addEventListener("touchend", (e) => {
        e.preventDefault();
        handleKeyRelease(key);
      });
    });

    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const keyElement = document.querySelector(`.key[data-key="${key}"]`);

      if (keyElement) {
        e.preventDefault();
        handleKeyPress(keyElement);
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      const keyElement = document.querySelector(`.key[data-key="${key}"]`);

      if (keyElement) {
        handleKeyRelease(keyElement);
      }
    });
  }

  // Initialize controls
  function initializeControls() {
    // Volume control
    volumeSlider.addEventListener("input", (e) => {
      currentVolume = e.target.value / 100;
      volumeValue.textContent = e.target.value + "%";

      if (masterGain) {
        masterGain.gain.value = currentVolume;
      }
    });

    // Waveform control
    waveformSelect.addEventListener("change", (e) => {
      currentWaveform = e.target.value;
      console.log("Waveform changed to:", currentWaveform);
    });

    // Octave control
    octaveSelect.addEventListener("change", (e) => {
      currentOctave = parseInt(e.target.value);
      console.log("Octave changed to:", currentOctave);
    });
  }

  // Initialize demo songs
  function initializeSongs() {
    const songs = {
      twinkle: [
        { note: "C", octave: 4 },
        { note: "C", octave: 4 },
        { note: "G", octave: 4 },
        { note: "G", octave: 4 },
        { note: "A", octave: 4 },
        { note: "A", octave: 4 },
        { note: "G", octave: 4 },
        { note: "F", octave: 4 },
        { note: "F", octave: 4 },
        { note: "E", octave: 4 },
        { note: "E", octave: 4 },
        { note: "D", octave: 4 },
        { note: "D", octave: 4 },
        { note: "C", octave: 4 },
      ],
      happy: [
        { note: "C", octave: 4 },
        { note: "C", octave: 4 },
        { note: "D", octave: 4 },
        { note: "C", octave: 4 },
        { note: "F", octave: 4 },
        { note: "E", octave: 4 },
        { note: "C", octave: 4 },
        { note: "C", octave: 4 },
        { note: "D", octave: 4 },
        { note: "C", octave: 4 },
        { note: "G", octave: 4 },
        { note: "F", octave: 4 },
      ],
      scale: [
        { note: "C", octave: 4 },
        { note: "D", octave: 4 },
        { note: "E", octave: 4 },
        { note: "F", octave: 4 },
        { note: "G", octave: 4 },
        { note: "A", octave: 4 },
        { note: "B", octave: 4 },
        { note: "C", octave: 5 },
      ],
      mary: [
        { note: "E", octave: 4 },
        { note: "D", octave: 4 },
        { note: "C", octave: 4 },
        { note: "D", octave: 4 },
        { note: "E", octave: 4 },
        { note: "E", octave: 4 },
        { note: "E", octave: 4 },
      ],
    };

    songButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const song = button.dataset.song;
        const notes = songs[song];

        if (notes) {
          // Stop current sounds
          stopAllSounds();

          // Play song with delays
          notes.forEach((noteData, index) => {
            setTimeout(() => {
              playNote(noteData.note, noteData.octave || currentOctave);

              // Visual feedback
              const key = document.querySelector(
                `.key[data-note="${noteData.note}"]`,
              );
              if (key) {
                key.classList.add("active");
                setTimeout(() => {
                  key.classList.remove("active");
                }, 300);
              }
            }, index * 500); // 500ms between notes
          });
        }
      });
    });
  }

  // Initialize video slider
  function initializeSlider() {
    let currentIndex = 0;

    function updateSlider() {
      cards.forEach((card, index) => {
        card.classList.remove("active", "prev", "next", "hidden");

        if (index === currentIndex) {
          card.classList.add("active");
        } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
          card.classList.add("prev");
        } else if (index === (currentIndex + 1) % cards.length) {
          card.classList.add("next");
        } else {
          card.classList.add("hidden");
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateSlider();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateSlider();
      });
    }

    // Initialize state
    updateSlider();

    // Auto-slide every 10 seconds
    setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider();
    }, 10000);
  }

  // Initialize on user interaction (required for iOS/Safari)
  function initializeOnInteraction() {
    const initAudio = () => {
      if (!isAudioInitialized) {
        initializeAudio();
        document.body.classList.add("audio-ready");
        console.log("Audio ready!");
      }
    };

    // Initialize on any user interaction
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });
    document.addEventListener("touchstart", initAudio, { once: true });
  }

  // Initialize everything
  function init() {
    initializeOnInteraction();
    initializeKeys();
    initializeControls();
    initializeSongs();
    initializeSlider();

    console.log("🎹 Piano & Slider initialized!");
    console.log(
      "Click keys or press: A S D F G H J K (W E T Y U for black keys)",
    );
  }

  // Start initialization
  init();

  // Export for debugging
  window.piano = {
    playNote,
    stopAllSounds,
    initializeAudio,
  };
});
