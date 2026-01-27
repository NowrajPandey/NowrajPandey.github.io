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
let firebaseInitialized = false;
let firebaseModules = null;

// ======================
// FIXED FIREBASE INITIALIZATION
// ======================
async function initializeFirebase() {
  // Return cached modules if already initialized
  if (firebaseModules) {
    console.log('Using cached Firebase modules');
    return firebaseModules;
  }
  
  try {
    console.log('Loading Firebase...');
    
    // IMPORTANT: Using CDN version that definitely works
    // Load Firebase App
    const firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
    
    // Load Firebase Firestore
    const firebaseFirestoreScript = document.createElement('script');
    firebaseFirestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
    
    // Wait for both scripts to load
    await new Promise((resolve, reject) => {
      let loaded = 0;
      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) {
          console.log('Firebase scripts loaded');
          resolve();
        }
      };
      
      firebaseAppScript.onload = checkLoaded;
      firebaseFirestoreScript.onload = checkLoaded;
      firebaseAppScript.onerror = reject;
      firebaseFirestoreScript.onerror = reject;
      
      document.head.appendChild(firebaseAppScript);
      document.head.appendChild(firebaseFirestoreScript);
    });
    
    // Now firebase should be available globally as window.firebase
    if (!window.firebase) {
      throw new Error('Firebase not loaded properly');
    }
    
    // Initialize Firebase app
    const app = window.firebase.initializeApp(firebaseConfig);
    const db = window.firebase.firestore();
    
    // Store all the functions we need
    firebaseModules = {
      app: app,
      db: db,
      getFirestore: () => window.firebase.firestore,
      collection: (dbRef, collectionName) => dbRef.collection(collectionName),
      getDocs: (collectionRef) => collectionRef.get(),
      query: (collectionRef, ...constraints) => collectionRef.where(...constraints),
      orderBy: (field, direction) => ({field: field, direction: direction || 'asc'}),
      doc: (dbRef, collectionName, docId) => dbRef.collection(collectionName).doc(docId),
      getDoc: (docRef) => docRef.get()
    };
    
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return firebaseModules;
    
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    
    // Fallback: Try alternative method
    try {
      console.log('Trying alternative Firebase initialization...');
      
      // Direct import method
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
      const { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } = 
        await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
      
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      firebaseModules = {
        app: app,
        db: db,
        getFirestore: getFirestore,
        collection: collection,
        getDocs: getDocs,
        query: query,
        orderBy: orderBy,
        doc: doc,
        getDoc: getDoc
      };
      
      firebaseInitialized = true;
      console.log('Firebase initialized via direct import');
      return firebaseModules;
      
    } catch (secondError) {
      console.error('All Firebase initialization methods failed:', secondError);
      showErrorToast('Database connection failed. Showing offline content.');
      return null;
    }
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
// PAGE NAVIGATION SYSTEM
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
          console.log('Loading piano content');
          loadPianoVideos();
        }, 300);
      } else if (pageId === 'blogs-content') {
        setTimeout(() => {
          console.log('Loading blog content');
          loadBlogs();
        }, 300);
      }
    }
  }

  // Handle URL hash changes
  function handleHashChange() {
    const hash = window.location.hash.substring(2); // Remove '#/'
    console.log('Hash changed to:', hash);
    
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
    
    // Close mobile menu
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('menuToggle');
    if (nav && menuToggle) {
      nav.classList.remove('active');
      menuToggle.querySelector('i').className = 'fas fa-bars';
    }
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
  window.addEventListener('popstate', handleHashChange);
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
// LOAD PIANO VIDEOS
// ======================
async function loadPianoVideos() {
  console.log('=== LOAD PIANO VIDEOS STARTED ===');
  const container = document.getElementById('pianoVideosContainer');
  if (!container) {
    console.error('Piano container not found');
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
    // Initialize Firebase
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not available');
    }
    
    console.log('Firebase loaded for piano:', firebase);
    
    // Get Firestore reference
    const db = firebase.db;
    
    // Get all piano videos
    const querySnapshot = await db.collection("pianoVideos").orderBy("timestamp", "desc").get();
    
    console.log('Piano videos found:', querySnapshot.size);
    
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
      
      console.log('Processing video:', video.pieceName);
      
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
      console.log('Piano videos loaded successfully');
    } else {
      container.innerHTML = `
        <div class="no-content">
          <i class="fas fa-music"></i>
          <h3>Piano Performances Coming Soon</h3>
          <p>I'm currently working on recording my piano performances.</p>
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
        <div style="margin-top: 2rem;">
          <h4>🎵 Currently Practicing</h4>
          <p>• Moonlight Sonata - Beethoven</p>
          <p>• Clair de Lune - Debussy</p>
          <p>• River Flows in You - Yiruma</p>
        </div>
      </div>
    `;
  }
}

// ======================
// LOAD BLOGS
// ======================
async function loadBlogs() {
  console.log('=== LOAD BLOGS STARTED ===');
  const container = document.getElementById('blogsList');
  if (!container) {
    console.error('Blogs container not found');
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
    // Initialize Firebase
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not available');
    }
    
    console.log('Firebase loaded for blogs:', firebase);
    
    // Get Firestore reference
    const db = firebase.db;
    
    // Get all blogs
    const querySnapshot = await db.collection("blogs").orderBy("timestamp", "desc").get();
    
    console.log('Blogs found:', querySnapshot.size);
    
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
      
      console.log('Processing blog:', blog.title, 'ID:', blogId);
      
      blogsData.push({
        id: blogId,
        data: blog
      });
      
      blogsHTML += `
        <div class="content-card blog-card" data-blog-id="${blogId}">
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

    // Store blogs data globally for easy access
    window.blogsData = blogsData;
    
    // Update HTML
    container.innerHTML = blogsHTML;
    console.log('Blogs HTML loaded');
    
    // Add click events to "Read More" buttons
    setTimeout(() => {
      const buttons = container.querySelectorAll('.read-more-btn');
      console.log('Found', buttons.length, 'read more buttons');
      
      buttons.forEach(button => {
        button.addEventListener('click', function() {
          const blogId = this.getAttribute('data-blog-id');
          console.log('Read More clicked for:', blogId);
          viewBlog(blogId);
        });
      });
    }, 100);

  } catch (error) {
    console.error('Error loading blogs:', error);
    
    // Fallback content
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-blog"></i>
        <h3>Blog Posts Coming Soon</h3>
        <p>I'm working on some exciting blog posts.</p>
        <div style="margin-top: 2rem;">
          <h4>📝 Upcoming Topics</h4>
          <p>• Learning Web Development Journey</p>
          <p>• Piano Practice Tips for Beginners</p>
          <p>• Balancing Studies with Creative Pursuits</p>
        </div>
      </div>
    `;
  }
}

// ======================
// VIEW BLOG DETAILS
// ======================
async function viewBlog(blogId) {
  console.log('=== VIEW BLOG STARTED === ID:', blogId);
  
  try {
    // First try to get from cached data
    if (window.blogsData) {
      const blog = window.blogsData.find(b => b.id === blogId);
      if (blog) {
        console.log('Blog found in cache:', blog.data.title);
        showBlogModal(blog.data);
        return;
      }
    }
    
    // If not in cache, fetch from Firebase
    const firebase = await initializeFirebase();
    if (!firebase) {
      showErrorToast('Cannot connect to database.');
      return;
    }
    
    const db = firebase.db;
    const docRef = db.collection("blogs").doc(blogId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists()) {
      const blog = docSnap.data();
      console.log('Blog loaded from Firebase:', blog.title);
      showBlogModal(blog);
    } else {
      showErrorToast('Blog post not found!');
    }
  } catch (error) {
    console.error('Error viewing blog:', error);
    showErrorToast('Error loading blog post.');
  }
}

// ======================
// SHOW BLOG MODAL
// ======================
function showBlogModal(blogData) {
  console.log('Showing blog modal:', blogData.title);
  soundManager.play();
  
  const blogModal = document.getElementById('blogModal');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  
  if (!blogModal || !blogModalTitle || !blogModalContent) {
    console.error('Blog modal elements missing');
    return;
  }
  
  // Set title
  blogModalTitle.textContent = blogData.title || 'Blog Post';
  
  // Format date
  let displayDate = 'Recently';
  try {
    if (blogData.timestamp?.toDate) {
      displayDate = blogData.timestamp.toDate().toLocaleDateString();
    }
  } catch (e) {}
  
  // Create HTML content
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
  
  // Update modal
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
  
  // Close button
  blogModalClose.addEventListener('click', () => {
    soundManager.play();
    blogModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
  
  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && blogModal.classList.contains('active')) {
      blogModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Close on outside click
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
  console.log('=== PORTFOLIO INITIALIZING ===');
  
  // Setup features
  setupNavigation();
  setupMobileMenu();
  setupBlogModal();
  
  // Make functions globally available
  window.loadPianoVideos = loadPianoVideos;
  window.loadBlogs = loadBlogs;
  window.viewBlog = viewBlog;
  window.showBlogModal = showBlogModal;
  window.showErrorToast = showErrorToast;
  window.soundManager = soundManager;
  
  console.log('=== PORTFOLIO INITIALIZED ===');
});
