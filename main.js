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

async function loadPianoVideos() {
  console.log('🎹 Loading piano videos...');
  const container = document.getElementById('pianoVideosContainer');
  if (!container) {
    console.error('❌ Piano container not found');
    return;
  }
  
  // Show loading
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading piano performances...</p>
    </div>
  `;
  
  try {
    // Get Firebase functions
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    // Initialize app
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase connected, fetching videos...');
    
    // Query pianoVideos collection
    const videosCollection = collection(db, 'pianoVideos');
    const videosQuery = query(videosCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(videosQuery);
    
    console.log(`📊 Found ${querySnapshot.size} videos`);
    
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
    
    // Loop through each document
    querySnapshot.forEach((doc) => {
      const video = doc.data();
      console.log('🎬 Processing video:', video);
      
      // Check what fields exist in your data
      console.log('Video fields:', Object.keys(video));
      
      // Get YouTube ID (check different possible field names)
      const youtubeId = video.youtubeId || video.link || video.url || '';
      console.log('YouTube ID:', youtubeId);
      
      if (youtubeId) {
        // Extract just the ID if it's a full URL
        let cleanYoutubeId = youtubeId;
        if (youtubeId.includes('youtube.com')) {
          const match = youtubeId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          cleanYoutubeId = match ? match[1] : youtubeId;
        }
        
        videosHTML += `
          <div class="video-card">
            <div class="video-player">
              <iframe 
                src="https://www.youtube.com/embed/${cleanYoutubeId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <div class="video-info">
              <h3>${video.pieceName || video.title || video.name || 'Untitled Piece'}</h3>
              <div class="video-meta">
                <span><i class="fas fa-user"></i> ${video.playedBy || video.artist || video.player || 'Unknown'}</span>
                <span><i class="fas fa-music"></i> ${video.composer || video.composerName || 'Unknown'}</span>
              </div>
              <div style="margin-top: 10px; font-size: 0.9rem; color: #888;">
                ${video.description || ''}
              </div>
            </div>
          </div>
        `;
      }
    });
    
    if (videosHTML) {
      container.innerHTML = videosHTML;
      console.log('✅ Piano videos displayed successfully');
    } else {
      container.innerHTML = `
        <div class="no-content">
          <i class="fas fa-exclamation-circle"></i>
          <h3>No Videos Available</h3>
          <p>Found ${querySnapshot.size} video(s) but couldn't display them.</p>
          <p>Check your data structure in Firebase.</p>
          <button onclick="loadPianoVideos()" style="margin-top: 15px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error loading piano videos:', error);
    
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Videos</h3>
        <p>${error.message}</p>
        <pre style="text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 0.8rem;">
${error.stack}
        </pre>
        <button onclick="loadPianoVideos()" style="margin-top: 15px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer;">
          Try Again
        </button>
      </div>
    `;
  }
}

async function loadBlogs() {
  console.log('📝 Loading blogs...');
  const container = document.getElementById('blogsList');
  if (!container) {
    console.error('❌ Blogs container not found');
    return;
  }
  
  // Show loading
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading blog posts...</p>
    </div>
  `;
  
  try {
    // Get Firebase functions
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    // Initialize app
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase connected, fetching blogs...');
    
    // Query blogs collection
    const blogsCollection = collection(db, 'blogs');
    const blogsQuery = query(blogsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(blogsQuery);
    
    console.log(`📊 Found ${querySnapshot.size} blogs`);
    
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
    window.blogsData = []; // Store for "Read More"
    
    // Loop through each document
    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const blogId = doc.id;
      
      console.log('📄 Processing blog:', blog);
      console.log('Blog fields:', Object.keys(blog));
      
      // Format date
      let displayDate = 'Recently';
      try {
        if (blog.timestamp && blog.timestamp.toDate) {
          displayDate = blog.timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } else if (blog.timestamp && blog.timestamp.seconds) {
          displayDate = new Date(blog.timestamp.seconds * 1000).toLocaleDateString();
        } else if (blog.date) {
          displayDate = blog.date;
        }
      } catch (e) {
        console.log('Date formatting error:', e);
      }
      
      // Store for "Read More"
      window.blogsData.push({
        id: blogId,
        data: blog
      });
      
      blogsHTML += `
        <div class="content-card blog-card">
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-category">${blog.category || blog.type || 'General'}</span>
              <span class="blog-date">${displayDate}</span>
            </div>
            <h3 class="blog-title">${blog.title || blog.name || 'Untitled Post'}</h3>
            <p class="blog-excerpt">${blog.excerpt || blog.description || blog.content?.substring(0, 150) || 'No excerpt available.'}...</p>
            <button class="read-more-btn" data-blog-id="${blogId}" onclick="viewBlog('${blogId}')">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = blogsHTML;
    console.log('✅ Blogs displayed successfully');
    
    // Add event listeners (alternative method)
    setTimeout(() => {
      const buttons = container.querySelectorAll('.read-more-btn');
      buttons.forEach(button => {
        button.addEventListener('click', function() {
          const blogId = this.getAttribute('data-blog-id');
          viewBlog(blogId);
        });
      });
    }, 100);
    
  } catch (error) {
    console.error('❌ Error loading blogs:', error);
    
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Blogs</h3>
        <p>${error.message}</p>
        <button onclick="loadBlogs()" style="margin-top: 15px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 5px; cursor: pointer;">
          Try Again
        </button>
      </div>
    `;
  }
}

async function viewBlog(blogId) {
  console.log('👁️ Viewing blog:', blogId);
  
  try {
    // Try cached data first
    if (window.blogsData) {
      const cachedBlog = window.blogsData.find(b => b.id === blogId);
      if (cachedBlog) {
        console.log('📖 Using cached blog:', cachedBlog.data.title);
        showBlogModal(cachedBlog.data);
        return;
      }
    }
    
    // Fetch fresh from Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, doc, getDoc } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const docRef = doc(db, 'blogs', blogId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const blog = docSnap.data();
      console.log('✅ Blog loaded:', blog.title);
      showBlogModal(blog);
    } else {
      alert('❌ Blog post not found!');
    }
    
  } catch (error) {
    console.error('❌ Error viewing blog:', error);
    alert('Error loading blog: ' + error.message);
  }
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

