// firebase-loader.js - Preload Firebase for better performance

// Preload Firebase SDKs for faster loading
function preloadFirebase() {
  // Create link elements for preloading
  const preloadApp = document.createElement('link');
  preloadApp.rel = 'preload';
  preloadApp.href = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
  preloadApp.as = 'script';
  
  const preloadFirestore = document.createElement('link');
  preloadFirestore.rel = 'preload';
  preloadFirestore.href = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
  preloadFirestore.as = 'script';
  
  // Add to document head
  document.head.appendChild(preloadApp);
  document.head.appendChild(preloadFirestore);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadFirebase);
} else {
  preloadFirebase();
}