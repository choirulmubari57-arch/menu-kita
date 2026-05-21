// ============================================================
// js/customer/menu.js — Menampilkan Daftar Menu dari Firestore
// ============================================================

import { db } from "../../firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { addToCart, getCart } from "./cart.js";

// ---- DOM Elements ----
const menuGrid    = document.getElementById("menuGrid");
const loadingState = document.getElementById("loadingState");
const emptyState  = document.getElementById("emptyState");
const errorState  = document.getElementById("errorState");

// ---- State ----
let allMenuItems = [];
let activeCategory = "all";

// ---- Format Harga (Rupiah) ----
export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// ---- Render satu menu card ----
function renderMenuCard(item) {
  const card = document.createElement("div");
  card.className = "menu-card";
  card.dataset.id = item.id;

  // Gambar atau placeholder
  const imgHtml = item.gambar
    ? `<img src="${item.gambar}" alt="${item.nama}" loading="lazy"
          onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><span>🍽️</span><span>No image</span></div>'">`
    : `<div class="img-placeholder"><span>🍽️</span><span>${item.nama}</span></div>`;

  card.innerHTML = `
    <div class="card-img-wrap">
      ${imgHtml}
      <span class="card-category-badge">${item.kategori || "menu"}</span>
    </div>
    <div class="card-body">
      <h3 class="card-name">${item.nama}</h3>
      <p class="card-desc">${item.deskripsi || "Menu lezat pilihan hari ini"}</p>
      <div class="card-footer">
        <div class="card-price">
          ${formatRupiah(item.harga)}
        </div>
        <button class="btn-add" data-id="${item.id}">
          <i class="ph ph-shopping-cart-simple"></i>
          Tambah
        </button>
      </div>
    </div>
  `;

  // Event listener tombol tambah
  card.querySelector(".btn-add").addEventListener("click", () => {
    addToCart(item);
    showToast(`${item.nama} ditambahkan ke keranjang!`);
    animateButton(card.querySelector(".btn-add"));
  });

  return card;
}

// ---- Render semua card berdasarkan filter ----
function renderMenu(items) {
  // Sembunyikan states
  loadingState?.classList.add("hidden");
  emptyState?.classList.add("hidden");
  errorState?.classList.add("hidden");

  // Bersihkan grid
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    emptyState?.classList.remove("hidden");
    return;
  }

  // Render setiap item dengan stagger animation delay
  items.forEach((item, i) => {
    const card = renderMenuCard(item);
    card.style.animationDelay = `${i * 0.06}s`;
    menuGrid.appendChild(card);
  });
}

// ---- Filter berdasarkan kategori ----
function filterMenu(category) {
  activeCategory = category;

  if (category === "all") {
    renderMenu(allMenuItems);
  } else {
    const filtered = allMenuItems.filter(
      (item) => item.kategori?.toLowerCase() === category
    );
    renderMenu(filtered);
  }
}

// ---- Ambil menu dari Firestore (realtime) ----
function fetchMenu() {
  // Tampilkan loading
  loadingState?.classList.remove("hidden");

  const menuRef = collection(db, "menu");
  const q = query(menuRef, orderBy("urutan", "asc"));

  // onSnapshot = realtime listener, update otomatis jika ada perubahan
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      allMenuItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      filterMenu(activeCategory);
    },
    (error) => {
      console.error("Error fetching menu:", error);
      loadingState?.classList.add("hidden");
      errorState?.classList.remove("hidden");
    }
  );

  // Kembalikan fungsi unsubscribe jika diperlukan
  return unsubscribe;
}

// ---- Animasi tombol tambah ----
function animateButton(btn) {
  btn.style.transform = "scale(0.9)";
  setTimeout(() => {
    btn.style.transform = "scale(1)";
  }, 150);
}

// ---- Toast notification ----
export function showToast(message, duration = 2500) {
  const toast    = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// ---- Setup Category Filter Buttons ----
function setupCategoryFilter() {
  const btns = document.querySelectorAll(".cat-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterMenu(btn.dataset.category);
    });
  });
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  fetchMenu();
  setupCategoryFilter();
});
