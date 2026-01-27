// main.js - Portfolio Website with Firebase

// ======================
// FIREBASE CONFIGURATION
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyCP-FF-B3hKADVJ5l5us5LAAQl2Sm-_ebU",
  authDomain: "mywebsite-b05e8.firebaseapp.com",
  projectId: "mywebsite-b05e8",
  storageBucket: "mywebsite-b05e8.firebasestorage.app",
  messagingSenderId: "1095561283748",
  appId: "1:1095561283748:web:9b1a7735fa787dded2be31"
};

// Global Firebase instance
let firebaseModules = null;

// ======================
// FIXED FIREBASE INITIALIZATION
// ======================
async function initializeFirebase() {
  if (firebaseModules) {
    return firebaseModules;
  }
  
  try {
    // Try direct import (most reliable)
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    firebaseModules = {
      app: app,
      db: db
    };
    
    console.log('Firebase initialized via import');
    return firebaseModules;
    
  } catch (error) {
    console.error('Firebase import failed:', error);
    
    // Try global firebase
    try {
      if (window.firebase) {
        const app = window.firebase.initializeApp(firebaseConfig);
        const db = window.firebase.firestore();
        
        firebaseModules = {
          app: app,
          db: db
        };
        
        console.log('Firebase initialized via global');
        return firebaseModules;
      }
    } catch (globalError) {
      console.error('Global Firebase also failed:', globalError);
    }
    
    return null;
  }
}

// ======================
// SIMPLE SOUND MANAGER
// ======================
const soundManager = {
  enabled: true,
  play() {
    if (this.enabled) {
      // Simple click sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Silent fail
      }
    }
  }
};

// ======================
// PAGE NAVIGATION SYSTEM - SIMPLIFIED
// ======================
function setupNavigation() {
  // Show a specific page
  function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
      page.style.display = 'none';
      page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.style.display = 'block';
      setTimeout(() => {
        targetPage.classList.add('active');
      }, 10);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Load content based on page
      if (pageId === 'piano-content') {
        setTimeout(() => {
          loadPianoVideos();
        }, 100);
      } else if (pageId === 'blogs-content') {
        setTimeout(() => {
          loadBlogs();
        }, 100);
      }
    }
  }

  // Handle URL hash changes
  function handleHashChange() {
    const hash = window.location.hash.substring(2);
    
    const pageMap = {
      '': 'home-content',
      'piano': 'piano-content',
      'blogs': 'blogs-content',
      'study': 'study-content',
      'goals': 'goals-content'
    };
    
    const pageId = pageMap[hash] || 'home-content';
    showPage(pageId);
    
    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkHash = link.getAttribute('href').substring(2);
      if ((hash === '' && linkHash === '') || (hash === linkHash)) {
        link.classList.add('active');
      }
    });
  }

  // Setup navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      soundManager.play();
      const href = this.getAttribute('href');
      window.location.hash = href;
    });
  });

  // Initial page load
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
  }
  
  handleHashChange();
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);
}

// ======================
// LOADING SCREEN FIX
// ======================
function setupLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  
  if (!loadingScreen) return;
  
  // Hide loading screen after short delay
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
    
    // Start greeting animation if on home page
    if (window.location.hash === '#/' || window.location.hash === '' || !window.location.hash) {
      animateGreetingText();
    }
  }, 800);
}

// Text typing animation
function animateGreetingText() {
  const greeting = document.querySelector('.greeting');
  if (!greeting) return;
  
  const originalText = greeting.textContent;
  greeting.textContent = '';
  
  let i = 0;
  const typeWriter = () => {
    if (i < originalText.length) {
      greeting.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    }
  };
  
  setTimeout(typeWriter, 300);
}

// ======================
// MOBILE MENU
// ======================
function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  
  if (!menuToggle || !nav) return;
  
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundManager.play();
    
    nav.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.className = nav.classList.contains('active') 
        ? 'fas fa-times' 
        : 'fas fa-bars';
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('active');
      const icon = menuToggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}

// ======================
// LOAD PIANO VIDEOS - SIMPLIFIED
// ======================
async function loadPianoVideos() {
  const container = document.getElementById('pianoVideosContainer');
  if (!container) return;

  // Show loading
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading piano performances...</p>
    </div>
  `;

  try {
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not available');
    }
    
    const db = firebase.db;
    
    // Get collection reference
    const pianoVideosRef = db.collection("pianoVideos");
    const querySnapshot = await pianoVideosRef.orderBy("timestamp", "desc").get();
    
    if (querySnapshot.empty) {
      container.innerHTML = `
        <div class="no-content">
          <i class="fas fa-music"></i>
          <h3>No Performances Yet</h3>
          <p>Check back soon for piano performances!</p>
        </div>
      `;
      return;
    }

    let videosHTML = '';
    querySnapshot.forEach((doc) => {
      const video = doc.data();
      const youtubeId = video.youtubeId || '';
      
      if (youtubeId) {
        videosHTML += `
          <div class="video-card">
            <div class="video-player">
              <iframe 
                src="https://www.youtube.com/embed/${youtubeId}" 
                frameborder="0" 
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <div class="video-info">
              <h3>${video.pieceName || 'Untitled Piece'}</h3>
              <div class="video-meta">
                <span><i class="fas fa-user"></i> ${video.playedBy || 'Unknown'}</span>
                <span><i class="fas fa-music"></i> ${video.composer || 'Unknown'}</span>
              </div>
            </div>
          </div>
        `;
      }
    });

    if (videosHTML) {
      container.innerHTML = videosHTML;
    } else {
      container.innerHTML = `
        <div class="no-content">
          <i class="fas fa-music"></i>
          <h3>Piano Performances Coming Soon</h3>
          <p>Currently working on recordings!</p>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error loading piano videos:', error);
    
    // Fallback content
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-music"></i>
        <h3>Piano Performances</h3>
        <p>Check back soon for piano performances!</p>
      </div>
    `;
  }
}

// ======================
// LOAD BLOGS - SIMPLIFIED
// ======================
async function loadBlogs() {
  const container = document.getElementById('blogsList');
  if (!container) return;

  // Show loading
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading blog posts...</p>
    </div>
  `;

  try {
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not available');
    }
    
    const db = firebase.db;
    const blogsRef = db.collection("blogs");
    const querySnapshot = await blogsRef.orderBy("timestamp", "desc").get();
    
    if (querySnapshot.empty) {
      container.innerHTML = `
        <div class="no-content">
          <i class="fas fa-blog"></i>
          <h3>No Blog Posts Yet</h3>
          <p>Check back soon for new blog posts!</p>
        </div>
      `;
      return;
    }

    let blogsHTML = '';
    const blogsData = [];
    
    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const blogId = doc.id;
      const date = blog.timestamp?.toDate?.() || new Date();
      
      blogsData.push({ id: blogId, data: blog });
      
      blogsHTML += `
        <div class="content-card blog-card">
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-category">${blog.category || 'General'}</span>
              <span class="blog-date">${date.toLocaleDateString()}</span>
            </div>
            <h3 class="blog-title">${blog.title || 'Untitled Post'}</h3>
            <p class="blog-excerpt">${blog.excerpt || 'No excerpt available.'}</p>
            <button class="read-more-btn" data-blog-id="${blogId}">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    });

    // Store blogs globally
    window.blogsData = blogsData;
    
    // Update HTML
    container.innerHTML = blogsHTML;
    
    // Add click events
    const buttons = container.querySelectorAll('.read-more-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const blogId = this.getAttribute('data-blog-id');
        viewBlog(blogId);
      });
    });

  } catch (error) {
    console.error('Error loading blogs:', error);
    
    // Fallback content
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-blog"></i>
        <h3>Blog Posts Coming Soon</h3>
        <p>Working on exciting blog posts!</p>
      </div>
    `;
  }
}

// ======================
// VIEW BLOG DETAILS
// ======================
async function viewBlog(blogId) {
  try {
    // Try cached data first
    if (window.blogsData) {
      const cachedBlog = window.blogsData.find(b => b.id === blogId);
      if (cachedBlog) {
        showBlogModal(cachedBlog.data);
        return;
      }
    }
    
    // Fetch from Firebase
    const firebase = await initializeFirebase();
    if (!firebase) {
      showErrorToast('Cannot connect to database.');
      return;
    }
    
    const db = firebase.db;
    const docRef = db.collection("blogs").doc(blogId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists()) {
      showBlogModal(docSnap.data());
    } else {
      showErrorToast('Blog post not found!');
    }
  } catch (error) {
    console.error('Error viewing blog:', error);
    showErrorToast('Error loading blog post.');
  }
}

// ======================
// BLOG MODAL
// ======================
function showBlogModal(blogData) {
  soundManager.play();
  
  const blogModal = document.getElementById('blogModal');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  
  if (!blogModal || !blogModalTitle || !blogModalContent) return;
  
  // Set title
  blogModalTitle.textContent = blogData.title || 'Blog Post';
  
  // Format date
  let displayDate = 'Recently';
  try {
    if (blogData.timestamp?.toDate) {
      displayDate = blogData.timestamp.toDate().toLocaleDateString();
    }
  } catch (e) {}
  
  // Create HTML
  const blogHTML = `
    <div class="blog-modal-meta">
      <span class="blog-modal-category">${blogData.category || 'General'}</span>
      <span class="blog-modal-date">
        <i class="far fa-calendar"></i> ${displayDate}
      </span>
    </div>
    
    <div class="blog-modal-body">
      ${blogData.content ? blogData.content.replace(/\n/g, '<br>') : 'No content available.'}
    </div>
    
    <div class="blog-modal-footer">
      <div class="blog-modal-actions">
        <button class="blog-modal-like">
          <i class="far fa-heart"></i> Like
        </button>
        <button class="blog-modal-share">
          <i class="fas fa-share-alt"></i> Share
        </button>
      </div>
    </div>
  `;
  
  blogModalContent.innerHTML = blogHTML;
  
  // Add event listeners
  setTimeout(() => {
    const likeBtn = blogModalContent.querySelector('.blog-modal-like');
    const shareBtn = blogModalContent.querySelector('.blog-modal-share');
    
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        soundManager.play();
        likeBtn.classList.toggle('liked');
        likeBtn.innerHTML = likeBtn.classList.contains('liked') 
          ? '<i class="fas fa-heart"></i> Liked'
          : '<i class="far fa-heart"></i> Like';
      });
    }
    
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        soundManager.play();
        if (navigator.share) {
          navigator.share({
            title: blogData.title,
            text: blogData.excerpt || blogData.title,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          const originalText = shareBtn.innerHTML;
          shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            shareBtn.innerHTML = originalText;
          }, 2000);
        }
      });
    }
  }, 100);
  
  // Show modal
  blogModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ======================
// BLOG MODAL SETUP
// ======================
function setupBlogModal() {
  const blogModal = document.getElementById('blogModal');
  const blogModalClose = document.getElementById('blogModalClose');
  
  if (!blogModal || !blogModalClose) return;
  
  blogModalClose.addEventListener('click', () => {
    soundManager.play();
    blogModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && blogModal.classList.contains('active')) {
      blogModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
  
  blogModal.addEventListener('click', (e) => {
    if (e.target === blogModal) {
      blogModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

// ======================
// ERROR TOAST
// ======================
function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// ======================
// INITIALIZE EVERYTHING
// ======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio loading...');
  
  // Setup loading screen first
  setupLoadingScreen();
  
  // Setup other features
  setupNavigation();
  setupMobileMenu();
  setupBlogModal();
  
  // Make functions globally available
  window.loadPianoVideos = loadPianoVideos;
  window.loadBlogs = loadBlogs;
  window.viewBlog = viewBlog;
  window.showBlogModal = showBlogModal;
  window.soundManager = soundManager;
  
  console.log('Portfolio ready!');
});
