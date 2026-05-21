// ============================================================
// js/customer/cart.js — Manajemen Keranjang Belanja
// Menggunakan localStorage agar data tidak hilang saat refresh
// ============================================================

// ---- Key untuk localStorage ----
const CART_KEY = "dapurkita_cart";

// ============================================================
// FUNGSI CORE CART
// ============================================================

/**
 * Ambil keranjang dari localStorage
 * @returns {Array} array item keranjang
 */
export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Simpan keranjang ke localStorage
 * @param {Array} cart
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

/**
 * Tambah item ke keranjang
 * Jika item sudah ada, increment quantity
 * @param {Object} item - data menu dari Firestore
 */
export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === item.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id:      item.id,
      nama:    item.nama,
      harga:   item.harga,
      gambar:  item.gambar || null,
      qty:     1,
    });
  }

  saveCart(cart);
}

/**
 * Kurangi quantity item
 * Jika qty sudah 1, hapus dari keranjang
 * @param {string} itemId
 */
export function decreaseCart(itemId) {
  let cart = getCart();
  const existing = cart.find((c) => c.id === itemId);

  if (!existing) return;

  if (existing.qty <= 1) {
    cart = cart.filter((c) => c.id !== itemId);
  } else {
    existing.qty -= 1;
  }

  saveCart(cart);
}

/**
 * Hapus item dari keranjang
 * @param {string} itemId
 */
export function removeFromCart(itemId) {
  const cart = getCart().filter((c) => c.id !== itemId);
  saveCart(cart);
}

/**
 * Kosongkan seluruh keranjang
 */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}

/**
 * Hitung total item di keranjang
 * @returns {number}
 */
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Hitung total harga keranjang
 * @returns {number}
 */
export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.harga * item.qty, 0);
}

// ============================================================
// UPDATE UI BADGE KERANJANG
// ============================================================

export function updateCartUI() {
  const count = getCartCount();

  // Badge di header nav
  const cartBadge = document.getElementById("cartBadge");
  if (cartBadge) cartBadge.textContent = count;

  // Badge & visibility di FAB
  const fabCart  = document.getElementById("fabCart");
  const fabBadge = document.getElementById("fabBadge");

  if (fabBadge) fabBadge.textContent = count;

  if (fabCart) {
    if (count > 0) {
      fabCart.classList.add("visible");
    } else {
      fabCart.classList.remove("visible");
    }
  }
}

// ============================================================
// RENDER HALAMAN KERANJANG (pages/cart.html)
// ============================================================

/**
 * Render daftar item keranjang di halaman cart
 */
export function renderCartPage() {
  const cartList   = document.getElementById("cartList");
  const emptyCart  = document.getElementById("emptyCart");
  const cartSummary = document.getElementById("cartSummary");
  const totalAmount = document.getElementById("totalAmount");

  if (!cartList) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartList.innerHTML  = "";
    emptyCart?.classList.remove("hidden");
    cartSummary?.classList.add("hidden");
    return;
  }

  emptyCart?.classList.add("hidden");
  cartSummary?.classList.remove("hidden");

  // Render setiap item
  cartList.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" id="cart-item-${item.id}">
      ${
        item.gambar
          ? `<img class="cart-item-img" src="${item.gambar}" alt="${item.nama}"
              onerror="this.outerHTML='<div class=\\'cart-item-img-placeholder\\'>🍽️</div>'">`
          : `<div class="cart-item-img-placeholder">🍽️</div>`
      }
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nama}</div>
        <div class="cart-item-price">${formatRupiah(item.harga * item.qty)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn minus" data-id="${item.id}">−</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-btn plus"  data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="btn-remove" data-id="${item.id}" title="Hapus">
        <i class="ph ph-trash"></i>
      </button>
    </div>
  `
    )
    .join("");

  // Update total
  if (totalAmount) totalAmount.textContent = formatRupiah(getCartTotal());

  // Pasang event listeners
  cartList.querySelectorAll(".qty-btn.plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id   = btn.dataset.id;
      const cart = getCart();
      const item = cart.find((c) => c.id === id);
      if (item) addToCart(item);
      renderCartPage();
    });
  });

  cartList.querySelectorAll(".qty-btn.minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      decreaseCart(btn.dataset.id);
      renderCartPage();
    });
  });

  cartList.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.id);
      renderCartPage();
    });
  });
}

// ---- Format Rupiah (lokal di cart.js) ----
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Update badge setiap halaman load
  updateCartUI();

  // Jika di halaman cart, render list
  if (document.getElementById("cartList")) {
    renderCartPage();
  }
});

