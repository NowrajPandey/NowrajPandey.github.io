import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --- Firebase Config ---
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

/* PAGES */
const Home = {
  template: `
    <div class="page">
      <h1>Welcome to My Space</h1>
      <p>Professional, minimal, smooth and cozy personal website to showcase my piano, learning and journey.</p>
    </div>
  `
};

const Piano = {
  template: `
    <div class="page">
      <h1>My Piano Videos</h1>
      <div v-if="loading" style="text-align:center;">Loading videos...</div>
      <div v-else-if="videos.length === 0" style="text-align:center;">No videos yet.</div>
      <div v-else>
        <div v-for="video in videos" :key="video.id" class="video-container" style="margin-bottom:30px;">
          <h3>{{ video.title }}</h3>
          <iframe :src="getEmbedURL(video.link)" width="100%" height="360" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `,
  data() {
    return { videos: [], loading: true, unsubscribe: null };
  },
  created() {
    const q = query(collection(db, "videos"), orderBy("timestamp", "desc"));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || "(No title)",
          link: data.link || "",
          timestamp: data.timestamp
        });
      });
      this.videos = list;
      this.loading = false;
    });
  },
  beforeUnmount() {
    if(this.unsubscribe) this.unsubscribe();
  },
  methods: {
    getEmbedURL(link) {
      if(!link) return "";
      let id = link.split("v=")[1] || link.split("youtu.be/")[1];
      if(!id) return "";
      id = id.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  }
};

const Study = { template: `<div class="page"><h1>Study & Learning</h1><p>All study notes and learning here.</p></div>` };
const Journey = { template: `<div class="page"><h1>My Life Journey</h1><p>Timeline of my experiences and milestones.</p></div>` };

/* ROUTES */
const routes = [
  { path: "/", component: Home },
  { path: "/piano", component: Piano },
  { path: "/study", component: Study },
  { path: "/journey", component: Journey }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

export default router;