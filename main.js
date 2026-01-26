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

// Firebase initialization
let firebaseApp = null;
let firestore = null;

async function initializeFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, db: firestore };
  }
  
  try {
    // CORRECT Firebase import URLs - using version 9.22.0
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    
    return { 
      app: firebaseApp, 
      db: firestore,
      getDocs,
      collection,
      query,
      orderBy,
      doc,
      getDoc
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    showErrorToast('Failed to connect to database. Using offline mode.');
    return null;
  }
}

// Initialize sound preferences
const soundManager = {
  enabled: localStorage.getItem('soundEnabled') !== 'false',
  volume: parseFloat(localStorage.getItem('soundVolume')) || 0.3,
  
  toggleMute() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    return this.enabled;
  },
  
  play(soundName) {
    if (this.enabled) {
      // Simple click sound simulation
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }
};

// Page Navigation System
function setupNavigation() {
  // Function to show page
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
      
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Load content for specific pages
      if (pageId === 'piano-content') {
        setTimeout(() => {
          loadPianoVideos();
        }, 300);
      } else if (pageId === 'blogs-content') {
        setTimeout(() => {
          loadBlogs();
        }, 300);
      }
    }
  }

  // Handle hash changes
  function handleHashChange() {
    const hash = window.location.hash.substring(2); // Remove '#/'
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
      const linkHash = link.getAttribute('href').substring(2); // Remove '#/'
      if ((hash === '' && linkHash === '') || (hash === linkHash)) {
        link.classList.add('active');
      }
    });
    
    // Close mobile menu if open
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('menuToggle');
    if (nav && menuToggle) {
      nav.classList.remove('active');
      menuToggle.querySelector('i').className = 'fas fa-bars';
    }
  }

  // Set up navigation links
  function setupNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        soundManager.play('click');
        const href = this.getAttribute('href');
        window.location.hash = href;
      });
    });
  }

  // Initialize navigation
  function initNavigation() {
    // Set up links
    setupNavLinks();
    
    // Handle initial hash
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    }
    
    // Initial page load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Also listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleHashChange);
  }

  // Start navigation
  initNavigation();
}

// Navbar auto-hide functionality
function setupAutoHideNavbar() {
  const header = document.getElementById('mainHeader');
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateHeader() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Auto-hide when scrolling down
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll);
}

// Sound toggle functionality
function setupSoundToggle() {
  const soundToggle = document.getElementById('soundToggle');
  
  if (!soundToggle) return;
  
  // Update initial state
  updateSoundIcon();
  
  soundToggle.addEventListener('click', () => {
    const enabled = soundManager.toggleMute();
    soundManager.play(enabled ? 'click' : 'mute');
    updateSoundIcon();
  });
  
  function updateSoundIcon() {
    if (soundManager.enabled) {
      soundToggle.classList.remove('muted');
    } else {
      soundToggle.classList.add('muted');
    }
  }
}

// Mobile menu functionality
function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  
  if (!menuToggle || !nav) return;
  
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundManager.play('click');
    
    nav.classList.toggle('active');
    
    // Update icon
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
      if (icon) {
        icon.className = 'fas fa-bars';
      }
    }
  });
  
  // Close menu when clicking a link
  nav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      soundManager.play('click');
      nav.classList.remove('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-bars';
      }
    }
  });
}

// Back to top button
function setupBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;
  
  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    soundManager.play('click');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
}

// Blog Modal Functionality
function setupBlogModal() {
  const blogModal = document.getElementById('blogModal');
  const blogModalClose = document.getElementById('blogModalClose');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  const blogModalProgress = document.querySelector('.blog-modal-progress');

  if (!blogModal || !blogModalClose) return;

  // Close modal
  blogModalClose.addEventListener('click', () => {
    soundManager.play('click');
    blogModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  });

  // Close on escape key
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

  // Reading progress
  if (blogModalContent) {
    blogModalContent.addEventListener('scroll', () => {
      const scrollTop = blogModalContent.scrollTop;
      const scrollHeight = blogModalContent.scrollHeight - blogModalContent.clientHeight;
      const scrollProgress = scrollTop / scrollHeight;
      
      if (blogModalProgress) {
        blogModalProgress.style.transform = `scaleX(${scrollProgress})`;
      }
    });
  }
}

// Helper function to format blog content
function formatBlogContent(content) {
  if (!content) return '<p>No content available.</p>';
  
  // Convert markdown-like formatting to HTML
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/p><p>/g, '</p><p>');
}

// Helper function to format blog date
function formatBlogDate(timestamp) {
  if (!timestamp) return 'Recently';
  
  try {
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  return 'Recently';
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
  
  typeWriter();
}

// Loading screen functionality
function setupLoadingScreen() {
  // Hide loading screen when page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          // Start greeting animation after loading
          animateGreetingText();
        }, 500);
      }
    }, 1000);
  });
  
  // Show loading state for dynamic content
  window.showLoading = function(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading content...</p>
        </div>
      `;
    }
  };
}

// Scroll progress bar
function setupScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  });
}

// Helper function to show error messages
function showErrorToast(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// ===========================
// FIREBASE FUNCTIONS
// ===========================

// Load piano videos from Firebase (with fallback)
async function loadPianoVideos() {
  const container = document.getElementById('pianoVideosContainer');
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading piano performances...</p>
    </div>
  `;

  try {
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase initialization failed');
    }

    const { db, getDocs, collection, query, orderBy } = firebase;
    const q = query(collection(db, "pianoVideos"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

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

    container.innerHTML = videosHTML || `
      <div class="no-content">
        <i class="fas fa-exclamation-circle"></i>
        <h3>No Videos Available</h3>
        <p>Check back later for updates.</p>
      </div>
    `;

  } catch (error) {
    console.error('Error loading piano videos:', error);
    
    // Fallback content when Firebase fails
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-music"></i>
        <h3>Piano Performances Coming Soon</h3>
        <p>I'm currently working on recording my piano performances. Check back soon!</p>
        <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px;">
            <h4>🎵 Currently Practicing</h4>
            <p>• Moonlight Sonata - Beethoven</p>
            <p>• Clair de Lune - Debussy</p>
            <p>• River Flows in You - Yiruma</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Load blogs from Firebase (with fallback)
async function loadBlogs() {
  const container = document.getElementById('blogsList');
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading blog posts...</p>
    </div>
  `;

  try {
    const firebase = await initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase initialization failed');
    }

    const { db, getDocs, collection, query, orderBy } = firebase;
    const q = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

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
    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const date = blog.timestamp?.toDate?.() || new Date();
      
      blogsHTML += `
        <div class="content-card blog-card" data-blog-id="${doc.id}">
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-category">${blog.category || 'General'}</span>
              <span class="blog-date">${date.toLocaleDateString()}</span>
            </div>
            <h3 class="blog-title">${blog.title || 'Untitled Post'}</h3>
            <p class="blog-excerpt">${blog.excerpt || 'No excerpt available.'}</p>
            <button class="read-more-btn" data-blog-id="${doc.id}">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = blogsHTML;
    
    // Add event listeners to read more buttons
    setTimeout(() => {
      const readMoreButtons = container.querySelectorAll('.read-more-btn');
      readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
          const blogId = this.getAttribute('data-blog-id');
          viewBlog(blogId);
        });
      });
    }, 100);

  } catch (error) {
    console.error('Error loading blogs:', error);
    
    // Fallback content when Firebase fails
    container.innerHTML = `
      <div class="no-content">
        <i class="fas fa-blog"></i>
        <h3>Blog Posts Coming Soon</h3>
        <p>I'm working on some exciting blog posts about technology, music, and learning. Stay tuned!</p>
        <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px;">
            <h4>📝 Upcoming Topics</h4>
            <p>• Learning Web Development Journey</p>
            <p>• Piano Practice Tips for Beginners</p>
            <p>• Balancing Studies with Creative Pursuits</p>
          </div>
        </div>
      </div>
    `;
  }
}

// View blog details from Firebase
async function viewBlog(blogId) {
  try {
    const firebase = await initializeFirebase();
    if (!firebase) {
      showErrorToast('Cannot connect to database. Please try again later.');
      return;
    }

    const { db, doc, getDoc } = firebase;
    const docSnap = await getDoc(doc(db, "blogs", blogId));

    if (docSnap.exists()) {
      const blog = docSnap.data();
      showBlogModal(blog);
    } else {
      showErrorToast('Blog post not found!');
    }
  } catch (error) {
    console.error('Error loading blog:', error);
    showErrorToast('Error loading blog post. Please try again.');
  }
}

// Show blog modal
function showBlogModal(blogData) {
  const blogModal = document.getElementById('blogModal');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  const blogModalProgress = document.querySelector('.blog-modal-progress');

  if (!blogModal || !blogModalTitle || !blogModalContent) return;
  
  soundManager.play('click');
  
  // Set title
  blogModalTitle.textContent = blogData.title || 'Blog Post';
  
  // Create blog content HTML
  const blogHTML = `
    ${blogData.image ? `
      <div class="blog-modal-hero-image">
        <img src="${blogData.image}" alt="${blogData.title}" loading="lazy">
      </div>
    ` : ''}
    
    <div class="blog-modal-meta">
      <span class="blog-modal-category">${blogData.category || 'General'}</span>
      <span class="blog-modal-date">
        <i class="far fa-calendar"></i>
        ${formatBlogDate(blogData.timestamp)}
      </span>
      ${blogData.author ? `
        <span class="blog-modal-author">
          <i class="far fa-user"></i>
          ${blogData.author}
        </span>
      ` : ''}
    </div>
    
    <div class="blog-modal-body">
      ${formatBlogContent(blogData.content || 'No content available.')}
    </div>
    
    ${blogData.tags && blogData.tags.length > 0 ? `
      <div class="blog-modal-footer">
        <div class="blog-modal-tags">
          ${blogData.tags.map(tag => `
            <span class="blog-modal-tag">${tag}</span>
          `).join('')}
        </div>
        <div class="blog-modal-actions">
          <button class="blog-modal-like">
            <i class="far fa-heart"></i> Like
          </button>
          <button class="blog-modal-share">
            <i class="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>
    ` : ''}
  `;
  
  // Update modal content
  blogModalContent.innerHTML = blogHTML;
  
  // Add event listeners for like/share buttons
  setTimeout(() => {
    const likeBtn = blogModalContent.querySelector('.blog-modal-like');
    const shareBtn = blogModalContent.querySelector('.blog-modal-share');
    
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        soundManager.play('click');
        likeBtn.classList.toggle('liked');
        likeBtn.innerHTML = likeBtn.classList.contains('liked') 
          ? '<i class="fas fa-heart"></i> Liked'
          : '<i class="far fa-heart"></i> Like';
      });
    }
    
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        soundManager.play('click');
        if (navigator.share) {
          navigator.share({
            title: blogData.title,
            text: blogData.excerpt || blogData.title,
            url: window.location.href,
          });
        } else {
          // Fallback: Copy to clipboard
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
  
  // Reset scroll position
  blogModalContent.scrollTop = 0;
  if (blogModalProgress) {
    blogModalProgress.style.transform = 'scaleX(0)';
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio initialized');
  
  // Setup all features
  setupNavigation();
  setupAutoHideNavbar();
  setupSoundToggle();
  setupMobileMenu();
  setupBackToTop();
  setupBlogModal();
  setupLoadingScreen();
  setupScrollProgress();
  
  // Make functions globally available
  window.soundManager = soundManager;
  window.loadPianoVideos = loadPianoVideos;
  window.loadBlogs = loadBlogs;
  window.viewBlog = viewBlog;
  window.showBlogModal = showBlogModal;
  window.showErrorToast = showErrorToast;
});
