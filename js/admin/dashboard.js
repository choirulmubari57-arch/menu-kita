// ============================================================
// js/admin/dashboard.js — Dashboard Statistik Admin
// ============================================================

import { db } from "../../firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- DOM Elements ----
const statTotal   = document.getElementById("statTotal");
const statBaru    = document.getElementById("statBaru");
const statProses  = document.getElementById("statProses");
const statSelesai = document.getElementById("statSelesai");

// ============================================================
// LISTEN ORDERS REALTIME UNTUK STATISTIK
// ============================================================
export function initDashboardStats() {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  // Realtime listener — statistik update otomatis
  onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Hitung per status
    const total   = orders.length;
    const baru    = orders.filter((o) => o.status === "baru").length;
    const proses  = orders.filter((o) => o.status === "diproses").length;
    const selesai = orders.filter((o) => o.status === "selesai").length;

    // Animasi angka
    animateCount(statTotal,   total);
    animateCount(statBaru,    baru);
    animateCount(statProses,  proses);
    animateCount(statSelesai, selesai);
  });
}

// ---- Animasi counter angka ----
function animateCount(el, target) {
  if (!el) return;

  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  const duration = 600;
  const steps    = 20;
  const increment = (target - current) / steps;
  let step = 0;
  let value = current;

  const timer = setInterval(() => {
    step++;
    value += increment;

    el.textContent = Math.round(value);

    if (step >= steps) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, duration / steps);
}

// ============================================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================================
export function initSidebarToggle() {
  const hamburger = document.getElementById("hamburger");
  const sidebar   = document.querySelector(".sidebar");
  const overlay   = document.getElementById("sidebarOverlay");

  hamburger?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("visible");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("visible");
  });
}

// ============================================================
// TOAST UTILITY
// ============================================================
export function showAdminToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.className = `toast ${type}`;
  toast.querySelector("span").textContent = message;
  toast.querySelector("i").className = `ph ph-${type === "success" ? "check-circle" : "x-circle"}`;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ============================================================
// FORMAT HELPERS
// ============================================================
export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

export function formatDateTime(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("id-ID", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(timestamp) {
  if (!timestamp) return "";
  const date  = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return "baru saja";
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initDashboardStats();
  initSidebarToggle();
});

