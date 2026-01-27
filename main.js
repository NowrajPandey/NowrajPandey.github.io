// main.js - Portfolio Website with Firebase

// ======================
// FIREBASE CONFIGURATION hello i am nowraj pandey
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyCP-FF-B3hKADVJ5l5us5LAAQl2Sm-_ebU",
  authDomain: "mywebsite-b05e8.firebaseapp.com",
  projectId: "mywebsite-b05e8",
  storageBucket: "mywebsite-b05e8.firebasestorage.app",
  messagingSenderId: "1095561283748",
  appId: "1:1095561283748:web:9b1a7735fa787dded2be31"
};

// ======================
// LOADING SCREEN
// ======================
function setupLoadingScreen() {
  setTimeout(() => {
    const loading = document.getElementById('loadingScreen');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => loading.style.display = 'none', 500);
    }
  }, 800);
}

// ======================
// PAGE NAVIGATION
// ======================
function setupNavigation() {
  function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
      page.style.display = 'none';
      page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.style.display = 'block';
      setTimeout(() => targetPage.classList.add('active'), 10);
      
      // Load content
      if (pageId === 'piano-content') {
        setTimeout(loadPianoVideos, 100);
      } else if (pageId === 'blogs-content') {
        setTimeout(loadBlogs, 100);
      }
    }
  }
  
  function handleHashChange() {
    const hash = window.location.hash.substring(2);
    const pageMap = {
      '': 'home-content',
      'piano': 'piano-content',
      'blogs': 'blogs-content',
      'study': 'study-content',
      'goals': 'goals-content'
    };
    
    showPage(pageMap[hash] || 'home-content');
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkHash = link.getAttribute('href').substring(2);
      if ((hash === '' && linkHash === '') || (hash === linkHash)) {
        link.classList.add('active');
      }
    });
  }
  
  // Setup nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = this.getAttribute('href');
    });
  });
  
  // Initial setup
  if (!window.location.hash) window.location.hash = '#/';
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
}

// ======================
// BLOG MODAL SETUP
// ======================
let blogScrollableEl = null;
let blogProgressHandler = null;

function updateBlogProgress() {
  const progressEl = document.getElementById('blogModalProgress');
  if (!progressEl || !blogScrollableEl) return;
  const { scrollTop, scrollHeight, clientHeight } = blogScrollableEl;
  const total = scrollHeight - clientHeight;
  const pct = total <= 0 ? 1 : Math.min(1, scrollTop / total);
  progressEl.style.transform = `scaleX(${pct})`;
}

function closeBlogModal() {
  const modal = document.getElementById('blogModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  if (blogScrollableEl && blogProgressHandler) {
    blogScrollableEl.removeEventListener('scroll', blogProgressHandler);
    blogScrollableEl = null;
    blogProgressHandler = null;
  }
  const progressEl = document.getElementById('blogModalProgress');
  if (progressEl) progressEl.style.transform = 'scaleX(0)';
}

function setupBlogModal() {
  const modal = document.getElementById('blogModal');
  const closeBtn = document.getElementById('blogModalClose');
  
  if (!modal || !closeBtn) return;
  
  closeBtn.addEventListener('click', closeBlogModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeBlogModal();
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeBlogModal();
    }
  });
}

// ======================
// SHOW BLOG MODAL FUNCTION
// ======================
function showBlogModal(blogData) {
  console.log('📖 Showing blog modal:', blogData.title);
  
  const blogModal = document.getElementById('blogModal');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  
  if (!blogModal || !blogModalTitle || !blogModalContent) {
    console.error('❌ Blog modal elements not found');
    return;
  }
  
  // Set title
  blogModalTitle.textContent = blogData.title || 'Blog Post';
  
  // Format date
  let displayDate = 'Recently';
  try {
    if (blogData.timestamp && blogData.timestamp.toDate) {
      displayDate = blogData.timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (blogData.timestamp && blogData.timestamp.seconds) {
      displayDate = new Date(blogData.timestamp.seconds * 1000).toLocaleDateString();
    } else if (blogData.date) {
      displayDate = blogData.date;
    }
  } catch (e) {
    console.log('Date formatting error:', e);
  }
  
  // Create blog content HTML
  const blogHTML = `
    ${blogData.image ? `
      <div class="blog-modal-hero-image">
        <img src="${blogData.image}" alt="${blogData.title}" loading="lazy">
      </div>
    ` : ''}
    
    <div class="blog-modal-meta">
      <span class="blog-modal-category">${blogData.category || blogData.type || 'General'}</span>
      <span class="blog-modal-date">
        <i class="far fa-calendar"></i> ${displayDate}
      </span>
      ${blogData.author ? `
        <span class="blog-modal-author">
          <i class="far fa-user"></i>
          ${blogData.author}
        </span>
      ` : ''}
    </div>
    
    <div class="blog-modal-body">
      ${blogData.content ? 
        blogData.content
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        : 'No content available.'}
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
  
  // Reset reading progress and scroll
  const progressEl = document.getElementById('blogModalProgress');
  if (progressEl) progressEl.style.transform = 'scaleX(0)';
  const scrollable = blogModal.querySelector('.blog-modal');
  if (scrollable) scrollable.scrollTop = 0;

  // Show modal
  blogModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Wire up scroll-driven progress bar
  if (scrollable && progressEl) {
    blogScrollableEl = scrollable;
    blogProgressHandler = updateBlogProgress;
    scrollable.addEventListener('scroll', blogProgressHandler);
    updateBlogProgress();
  }
}

// ======================
// LOAD PIANO VIDEOS
// ======================
async function loadPianoVideos() {
  console.log('🎹 Loading piano videos...');
  const container = document.getElementById('pianoVideosContainer');
  if (!container) return;
  
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading piano performances...</p>
    </div>
  `;
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase connected, fetching videos...');
    
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
    
    querySnapshot.forEach((doc) => {
      const video = doc.data();
      const youtubeId = video.youtubeId || video.link || video.url || '';
      
      if (youtubeId) {
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
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <div class="video-info">
              <h3>${video.pieceName || video.title || 'Untitled Piece'}</h3>
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
      console.log('✅ Piano videos displayed successfully');
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
    console.error('❌ Error loading piano videos:', error);
    
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
// LOAD BLOGS
// ======================
async function loadBlogs() {
  console.log('📝 Loading blogs...');
  const container = document.getElementById('blogsList');
  if (!container) return;
  
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading blog posts...</p>
    </div>
  `;
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = 
      await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase connected, fetching blogs...');
    
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
    window.blogsData = [];
    
    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const blogId = doc.id;
      
      let displayDate = 'Recently';
      try {
        if (blog.timestamp && blog.timestamp.toDate) {
          displayDate = blog.timestamp.toDate().toLocaleDateString();
        } else if (blog.timestamp && blog.timestamp.seconds) {
          displayDate = new Date(blog.timestamp.seconds * 1000).toLocaleDateString();
        }
      } catch (e) {}
      
      window.blogsData.push({
        id: blogId,
        data: blog
      });
      
      blogsHTML += `
        <div class="content-card blog-card">
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-category">${blog.category || 'General'}</span>
              <span class="blog-date">${displayDate}</span>
            </div>
            <h3 class="blog-title">${blog.title || 'Untitled Post'}</h3>
            <p class="blog-excerpt">${blog.excerpt || 'No excerpt available.'}</p>
            <button class="read-more-btn" onclick="viewBlog('${blogId}')">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = blogsHTML;
    console.log('✅ Blogs displayed successfully');
    
  } catch (error) {
    console.error('❌ Error loading blogs:', error);
    
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
// VIEW BLOG
// ======================
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
// INITIALIZE EVERYTHING
// ======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Portfolio initializing...');
  
  // Setup features
  setupLoadingScreen();
  setupNavigation();
  setupBlogModal();
  
  // Make functions globally available
  window.loadPianoVideos = loadPianoVideos;
  window.loadBlogs = loadBlogs;
  window.viewBlog = viewBlog;
  window.showBlogModal = showBlogModal;
  
  console.log('✅ Portfolio ready!');
});
