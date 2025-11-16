// firebase.js  (ES module)

// Import Firebase SDK (v10.7.1) from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --------------------------
// Your Firebase Config
// --------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD9che5f2StuXcM8YtZefZQqcTiUs-iDmg",
  authDomain: "bookmyticket-7e6a5.firebaseapp.com",
  databaseURL: "https://bookmyticket-7e6a5-default-rtdb.firebaseio.com",
  projectId: "bookmyticket-7e6a5",
  storageBucket: "bookmyticket-7e6a5.firebasestorage.app",
  messagingSenderId: "911524079733",
  appId: "1:911524079733:web:504118cc62e07d5470703c",
  measurementId: "G-CDLWZJP6Q8"
};

// --------------------------
// Initialize Firebase
// --------------------------
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Realtime Database
const db = getDatabase(app);

// --------------------------
// Expose to window so non-module scripts (app.js, login.js, signup.js) can use it
// --------------------------
window.firebaseApp = app;

window.auth = auth;
window.provider = provider;
window.db = db;

// Auth helpers
window.signInWithPopup = signInWithPopup;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.sendEmailVerification = sendEmailVerification;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;

// DB helpers
window.dbRef = ref;
window.dbSet = set;
window.dbGet = get;
window.dbChild = child;
window.dbUpdate = update;
