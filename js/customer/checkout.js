// ============================================================
// js/customer/checkout.js — Proses Checkout & Simpan Order ke Firestore
// ============================================================

import { db } from "../../firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getCart, getCartTotal, clearCart } from "./cart.js";

// ---- Format Rupiah ----
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// ============================================================
// RENDER ORDER SUMMARY DI HALAMAN CHECKOUT
// ============================================================
function renderOrderSummary() {
  const summaryList  = document.getElementById("summaryList");
  const summaryTotal = document.getElementById("summaryTotal");

  if (!summaryList) return;

  const cart = getCart();

  if (cart.length === 0) {
    // Redirect ke index jika keranjang kosong
    window.location.href = "../index.html";
    return;
  }

  // Render daftar item
  summaryList.innerHTML = cart
    .map(
      (item) => `
    <div class="order-summary-item">
      <div>
        <div class="order-item-name">${item.nama}</div>
        <div class="order-item-qty">× ${item.qty}</div>
      </div>
      <div class="order-item-sub">${formatRupiah(item.harga * item.qty)}</div>
    </div>
  `
    )
    .join("");

  // Tampilkan total
  if (summaryTotal) summaryTotal.textContent = formatRupiah(getCartTotal());
}

// ============================================================
// SUBMIT ORDER KE FIRESTORE
// ============================================================
async function submitOrder(event) {
  event.preventDefault();

  const btnSubmit = document.getElementById("btnSubmit");
  const form      = document.getElementById("checkoutForm");

  // Ambil data form
  const nama     = document.getElementById("inputNama")?.value.trim();
  const whatsapp = document.getElementById("inputWhatsapp")?.value.trim();
  const catatan  = document.getElementById("inputCatatan")?.value.trim();

  // Validasi manual
  if (!nama || !whatsapp) {
    showFormError("Nama dan nomor WhatsApp wajib diisi!");
    return;
  }

  if (!/^[0-9+\-\s]{8,15}$/.test(whatsapp)) {
    showFormError("Nomor WhatsApp tidak valid!");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showFormError("Keranjang belanja kosong!");
    return;
  }

  // Loading state
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `
    <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>
    Memproses...
  `;

  try {
    // ---- Data order yang akan disimpan ke Firestore ----
    const orderData = {
      pelanggan: {
        nama:      nama,
        whatsapp:  whatsapp,
      },
      items: cart.map((item) => ({
        id:     item.id,
        nama:   item.nama,
        harga:  item.harga,
        qty:    item.qty,
        subtotal: item.harga * item.qty,
      })),
      total:     getCartTotal(),
      catatan:   catatan || "",
      status:    "baru",            // Status default: baru
      createdAt: serverTimestamp(), // Timestamp server Firestore
    };

    // ---- Simpan ke collection "orders" ----
    const docRef = await addDoc(collection(db, "orders"), orderData);

    console.log("Order berhasil dibuat:", docRef.id);

    // Kosongkan keranjang setelah order berhasil
    clearCart();

    // Redirect ke halaman sukses dengan order ID
    window.location.href = `success.html?orderId=${docRef.id}`;
  } catch (error) {
    console.error("Error menyimpan order:", error);
    showFormError("Gagal mengirim pesanan. Silakan coba lagi.");

    // Reset tombol
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <i class="ph ph-paper-plane-tilt"></i>
      Pesan Sekarang
    `;
  }
}

// ---- Tampilkan pesan error form ----
function showFormError(message) {
  let errEl = document.getElementById("formError");

  if (!errEl) {
    errEl = document.createElement("div");
    errEl.id = "formError";
    errEl.style.cssText = `
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #EF4444;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      margin-bottom: 12px;
      text-align: center;
    `;
    const form = document.getElementById("checkoutForm");
    form?.prepend(errEl);
  }

  errEl.textContent = message;
  errEl.scrollIntoView({ behavior: "smooth", block: "center" });

  // Hilangkan setelah 4 detik
  setTimeout(() => errEl?.remove(), 4000);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();

  // Pasang event listener form checkout
  const form = document.getElementById("checkoutForm");
  form?.addEventListener("submit", submitOrder);
});
