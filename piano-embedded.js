// piano-embedded.js - Refined Piano & Card Stack Showcase
document.addEventListener("DOMContentLoaded", function () {
  // --- BRAND COLORS & CONFIG ---
  const CONFIG = {
    AUTO_CYCLE_MS: 12000,
    SWIPE_THRESHOLD: 50,
  };

  // --- AUDIO LOGIC ---
  let audioContext;
  let masterGain;

  const noteFrequencies = {
    C: 261.63, "C#": 277.18, D: 293.66, "D#": 311.13, E: 329.63,
    F: 349.23, "F#": 369.99, G: 392.0, "G#": 415.3, A: 440.0,
    "A#": 466.16, B: 493.88,
  };

  const keys = document.querySelectorAll(".piano-interactive .key");
  const volumeSlider = document.getElementById("main-volume");
  const waveformSelect = document.getElementById("main-waveform");
  const octaveSelect = document.getElementById("main-octave");

  let activeOscillators = {};
  let currentVolume = 0.7;
  let currentWaveform = "sine";
  let currentOctave = 4;
  let isAudioInitialized = false;

  function initializeAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = currentVolume;
      isAudioInitialized = true;
    }
  }

  function playNote(note, octave = currentOctave) {
    if (!isAudioInitialized) initializeAudio();
    try {
      let baseFreq = noteFrequencies[note];
      if (!baseFreq) return;
      let frequency = baseFreq * Math.pow(2, octave - 4);

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.type = currentWaveform;
      oscillator.frequency.value = frequency;

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(currentVolume * 0.7, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      oscillator.start(now);
      oscillator.stop(now + 1.2);

      const id = note + octave + Date.now();
      activeOscillators[id] = { oscillator, gainNode };
      setTimeout(() => delete activeOscillators[id], 1200);

      // Visual feedback
      const keyEl = document.querySelector(`.piano-interactive .key[data-note="${note}"]`);
      if (keyEl) {
        keyEl.classList.add("active");
        setTimeout(() => keyEl.classList.remove("active"), 150);
      }
    } catch (error) { console.error("Error playing note:", error); }
  }

  function handleKeyPress(keyElement) {
    const note = keyElement.dataset.note;
    const octave = keyElement.dataset.octave ? parseInt(keyElement.dataset.octave) : currentOctave;
    if (note) playNote(note, octave);
  }

  function initializePiano() {
    keys.forEach(key => {
      key.addEventListener("mousedown", e => { e.preventDefault(); handleKeyPress(key); });
      key.addEventListener("touchstart", e => { e.preventDefault(); handleKeyPress(key); });
    });

    const keyMap = { a: "C", w: "C#", s: "D", e: "D#", d: "E", f: "F", t: "F#", g: "G", y: "G#", h: "A", u: "A#", j: "B", k: "C" };
    document.addEventListener("keydown", e => {
      if (e.repeat) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        const octave = e.key.toLowerCase() === 'k' ? 5 : currentOctave;
        playNote(note, octave);
      }
    });

    if (volumeSlider) volumeSlider.addEventListener("input", e => {
      currentVolume = e.target.value / 100;
      if (masterGain) masterGain.gain.value = currentVolume;
    });
    if (waveformSelect) waveformSelect.addEventListener("change", e => currentWaveform = e.target.value);
    if (octaveSelect) octaveSelect.addEventListener("change", e => currentOctave = parseInt(e.target.value));
  }

  // --- CARD STACK LOGIC ---
  function initializeStack() {
    const stack = document.getElementById("video-stack");
    const cards = Array.from(stack.querySelectorAll(".stack-card"));
    const prevBtn = document.getElementById("stack-prev");
    const nextBtn = document.getElementById("stack-next");
    const shuffleBtn = document.getElementById("stack-shuffle");
    const resetBtn = document.getElementById("stack-reset");

    let items = [...cards];
    let isDragging = false;
    let startY = 0;
    let currentY = 0;

    function updateStack() {
      items.forEach((card, index) => {
        card.classList.remove("active");
        if (index === 0) {
          card.classList.add("active");
          card.style.transform = `translateY(0) scale(1)`;
          card.style.opacity = "1";
          card.style.zIndex = "10";
          card.style.filter = "none";
        } else {
          const depth = Math.min(index, 3);
          const yOffset = -30 * depth;
          const scale = 1 - (0.05 * depth);
          const opacity = 1 - (0.2 * depth);
          card.style.transform = `translateY(${yOffset}px) scale(${scale})`;
          card.style.opacity = opacity;
          card.style.zIndex = 10 - index;
          card.style.filter = `brightness(${1 - 0.2 * depth})`;
        }
      });
    }

    function moveUp() {
      const firstItem = items.shift();
      items.push(firstItem);
      updateStack();
    }

    function moveDown() {
      const lastItem = items.pop();
      items.unshift(lastItem);
      updateStack();
    }

    function shuffle() {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      updateStack();
    }

    function reset() {
      items = [...cards];
      updateStack();
    }

    // Drag Events
    stack.addEventListener("mousedown", (e) => {
      if (e.target.closest('iframe')) return; // Allow iframe interaction if active
      isDragging = true;
      startY = e.pageY;
      stack.style.transition = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      currentY = e.pageY;
      const diff = currentY - startY;
      if (Math.abs(diff) > 10) {
        e.preventDefault();
      }
    });

    window.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentY - startY;
      if (diff < -CONFIG.SWIPE_THRESHOLD) moveUp();
      else if (diff > CONFIG.SWIPE_THRESHOLD) moveDown();
      currentY = 0;
      startY = 0;
    });

    // Touch Events
    stack.addEventListener("touchstart", (e) => {
      startY = e.touches[0].pageY;
      isDragging = true;
    });

    stack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].pageY;
    });

    stack.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentY - startY;
      if (diff < -CONFIG.SWIPE_THRESHOLD) moveUp();
      else if (diff > CONFIG.SWIPE_THRESHOLD) moveDown();
      currentY = 0;
      startY = 0;
    });

    // Button Events
    if (nextBtn) nextBtn.addEventListener("click", moveUp);
    if (prevBtn) prevBtn.addEventListener("click", moveDown);
    if (shuffleBtn) shuffleBtn.addEventListener("click", shuffle);
    if (resetBtn) resetBtn.addEventListener("click", reset);

    updateStack();
    setInterval(moveUp, CONFIG.AUTO_CYCLE_MS);

    // Expose functions globally for dynamic content updates
    window.refreshStack = () => {
      items = Array.from(stack.querySelectorAll(".stack-card"));
      updateStack();
    };
    window.moveStackUp = moveUp;
    window.moveStackDown = moveDown;
  }

  // --- INIT ---
  const initAudioOnInteract = () => { if (!isAudioInitialized) initializeAudio(); };
  document.addEventListener("click", initAudioOnInteract, { once: true });
  document.addEventListener("keydown", initAudioOnInteract, { once: true });

  initializePiano();
  initializeStack();
  console.log("🎹 Refined Piano & Card Stack initialized!");
});
