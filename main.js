// main.js - Fixed cursor and loading issues

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

// Cursor effect - Fixed for home page only
function setupCursorEffect() {
  const cursor = document.querySelector('.cursor-effect');
  
  // Only setup cursor on home page
  const isHomePage = window.location.hash === '#/' || window.location.hash === '';
  if (!cursor || !isHomePage) {
    if (cursor) cursor.style.display = 'none';
    return;
  }
  
  // Check if device supports hover
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    cursor.style.display = 'none';
    return;
  }
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  
  // Hover effects
  const hoverElements = document.querySelectorAll(
    'a, button, .skill-card, .content-card, .blog-card, .project-card'
  );
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.background = 'rgba(0, 102, 255, 0.3)';
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.background = 'var(--accent)';
    });
  });
  
  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

// Blog Modal Functionality
function setupBlogModal() {
  const blogModal = document.getElementById('blogModal');
  const blogModalClose = document.getElementById('blogModalClose');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  const blogModalProgress = document.querySelector('.blog-modal-progress');

  // Close modal
  blogModalClose.addEventListener('click', () => {
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

  // Make function global
  window.showBlogModal = function(blogData) {
    if (!blogModal || !blogModalTitle || !blogModalContent) return;
    
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
          likeBtn.classList.toggle('liked');
          likeBtn.innerHTML = likeBtn.classList.contains('liked') 
            ? '<i class="fas fa-heart"></i> Liked'
            : '<i class="far fa-heart"></i> Like';
        });
      }
      
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
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
  };
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

// Update your existing readBlog function to use the new modal
function readBlog(blogId) {
  // Import and initialize Firebase
  import("https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js")
    .then(({ initializeApp }) => {
      return import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js")
        .then(({ getFirestore, doc, getDoc }) => {
          const firebaseConfig = {
            apiKey: "AIzaSyCP-FF-B3hKADVJ5l5us5LAAQl2Sm-_ebU",
            authDomain: "mywebsite-b05e8.firebaseapp.com",
            projectId: "mywebsite-b05e8",
            storageBucket: "mywebsite-b05e8.firebasestorage.app",
            messagingSenderId: "1095561283748",
            appId: "1:1095561283748:web:9b1a7735fa787dded2be31"
          };

          const app = initializeApp(firebaseConfig);
          const db = getFirestore(app);

          return getDoc(doc(db, "blogs", blogId));
        });
    })
    .then((docSnap) => {
      if (docSnap.exists()) {
        const blog = docSnap.data();
        window.showBlogModal(blog);
      } else {
        alert('Blog post not found!');
      }
    })
    .catch(error => {
      console.error('Error loading blog:', error);
      alert('Error loading blog post. Please try again.');
    });
}

// Initialize blog modal on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupBlogModal();
});

// Page loading functionality
function setupPageLoading() {
  // Hide loading screen when page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
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

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio initialized');
  
  // Setup all features
  setupAutoHideNavbar();
  setupSoundToggle();
  setupMobileMenu();
  setupCursorEffect();
  setupPageLoading();
  
  // Show greeting animation
  setTimeout(animateGreetingText, 1000);
});

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

// Make functions globally available
window.soundManager = soundManager;

// firebase-loader.js - Fixed loading for blogs and piano videos

// Initialize Firebase with error handling
async function initializeFirebase() {
  try {
    // Import Firebase modules
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js");
    const { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } = 
      await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");

    const firebaseConfig = {
      apiKey: "AIzaSyCP-FF-B3hKADVJ5l5us5LAAQl2Sm-_ebU",
      authDomain: "mywebsite-b05e8.firebaseapp.com",
      projectId: "mywebsite-b05e8",
      storageBucket: "mywebsite-b05e8.firebasestorage.app",
      messagingSenderId: "1095561283748",
      appId: "1:1095561283748:web:9b1a7735fa787dded2be31"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    return { db, getDocs, collection, query, orderBy, doc, getDoc };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

// Load piano videos
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
      throw new Error('Failed to initialize Firebase');
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
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load Content</h3>
        <p>Please check your connection and try again.</p>
        <button onclick="loadPianoVideos()" class="btn btn-secondary">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// Load blogs
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
      throw new Error('Failed to initialize Firebase');
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
        <div class="content-card blog-card">
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-category">${blog.category || 'General'}</span>
              <span class="blog-date">${date.toLocaleDateString()}</span>
            </div>
            <h3 class="blog-title">${blog.title || 'Untitled Post'}</h3>
            <p class="blog-excerpt">${blog.excerpt || 'No excerpt available.'}</p>
            <button class="read-more-btn" onclick="viewBlog('${doc.id}')">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = blogsHTML;

  } catch (error) {
    console.error('Error loading blogs:', error);
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load Blogs</h3>
        <p>Please check your connection and try again.</p>
        <button onclick="loadBlogs()" class="btn btn-secondary">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// View blog details
async function viewBlog(blogId) {
  try {
    const firebase = await initializeFirebase();
    if (!firebase) return;

    const { db, doc, getDoc } = firebase;
    const docSnap = await getDoc(doc(db, "blogs", blogId));

    if (docSnap.exists()) {
      const blog = docSnap.data();
      const modal = createBlogModal(blog);
      document.body.appendChild(modal);
    }
  } catch (error) {
    alert('Error loading blog post. Please try again.');
  }
}

function createBlogModal(blog) {
  const modal = document.createElement('div');
  modal.className = 'blog-modal-overlay';
  modal.innerHTML = `
    <div class="blog-modal">
      <div class="blog-modal-header">
        <h2>${blog.title || 'Untitled Post'}</h2>
        <button class="blog-modal-close" onclick="this.closest('.blog-modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="blog-modal-content">
        <div class="blog-modal-meta">
          <span>${blog.category || 'General'}</span>
          <span>${blog.timestamp?.toDate?.().toLocaleDateString() || 'Recently'}</span>
        </div>
        <div class="blog-modal-body">
          ${blog.content || 'No content available.'}
        </div>
      </div>
    </div>
  `;
  return modal;
}

// Setup page navigation with content loading
document.addEventListener('DOMContentLoaded', () => {
  // Handle page changes
  window.addEventListener('hashchange', handlePageChange);
  
  // Initial load
  handlePageChange();
});

function handlePageChange() {
  const hash = window.location.hash.slice(2) || '';
  
  // Update cursor based on page
  const cursor = document.querySelector('.cursor-effect');
  if (cursor) {
    if (hash === '' || hash === 'home') {
      cursor.style.display = 'block';
    } else {
      cursor.style.display = 'none';
    }
  }
  
  // Load specific content
  if (hash === 'piano') {
    setTimeout(loadPianoVideos, 500);
  } else if (hash === 'blogs') {
    setTimeout(loadBlogs, 500);
  }
}

// Make functions globally available
window.loadPianoVideos = loadPianoVideos;
window.loadBlogs = loadBlogs;

window.viewBlog = viewBlog;
