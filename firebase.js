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
  apiKey: "AIzaSyARoy4OI_kCHa0IaV0nMoCOoJoWQ8Zbc_0",
  authDomain: "menu-299e2.firebaseapp.com",
  projectId: "menu-299e2",
  storageBucket: "menu-299e2.firebasestorage.app",
  messagingSenderId: "927331286067",
  appId: "1:927331286067:web:d14b027126801ed5c9b746"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor Firestore dan Auth untuk digunakan di file lain
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
