// ============================================================
// firebase.js — Konfigurasi Firebase (Firebase v10 Modular)
// ============================================================
// Ganti nilai di bawah dengan konfigurasi Firebase project Anda
// Dapatkan dari: Firebase Console > Project Settings > Your apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ⚠️ GANTI dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor Firestore dan Auth untuk digunakan di file lain
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
