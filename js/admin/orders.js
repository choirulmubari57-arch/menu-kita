// ============================================================
// js/admin/orders.js — Tampilkan Semua Order Realtime
// ============================================================

import { db } from "../../firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { formatRupiah, formatDateTime, timeAgo } from "./dashboard.js";
import { updateOrderStatus } from "./status.js";

// ---- DOM Elements ----
const ordersList   = document.getElementById("ordersList");
const loadingState = document.getElementById("loadingState");
const emptyState   = document.getElementById("emptyState");

// ---- State ----
let allOrders     = [];
let activeFilter  = "all";

// ============================================================
// RENDER SATU ORDER CARD
// ============================================================
function renderOrderCard(order) {
  const card = document.createElement("div");
  card.className = "order-card";
  card.id = `order-${order.id}`;

  // Items list
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <div class="order-item-row">
      <span class="order-item-row-name">${item.nama}</span>
      <span class="order-item-row-qty">× ${item.qty}</span>
      <span class="order-item-row-sub">${formatRupiah(item.subtotal || item.harga * item.qty)}</span>
    </div>
  `
    )
    .join("");

  // Status badge class
  const statusMap = {
    baru:       { label: "Baru",       icon: "clock" },
    diproses:   { label: "Diproses",   icon: "spinner" },
    selesai:    { label: "Selesai",    icon: "check-circle" },
    dibatalkan: { label: "Dibatalkan", icon: "x-circle" },
  };

  const statusInfo = statusMap[order.status] || statusMap.baru;

  // Catatan
  const catatanHtml = order.catatan
    ? `<p class="order-note"><i class="ph ph-note"></i> ${order.catatan}</p>`
    : "";

  card.innerHTML = `
    <div class="order-card-header">
      <div class="order-meta">
        <div class="order-id">#${order.id.slice(-8).toUpperCase()}</div>
        <div class="order-customer">
          <i class="ph ph-user" style="font-size:14px;opacity:.6;"></i>
          ${order.pelanggan?.nama || "—"}
        </div>
        <div class="order-time">
          <i class="ph ph-clock"></i>
          <span title="${formatDateTime(order.createdAt)}">${timeAgo(order.createdAt)}</span>
        </div>
        ${
          order.pelanggan?.meja
    ? `<div class="order-time" style="margin-top:2px;">
        <i class="ph ph-table"></i>
        Meja ${order.pelanggan.meja}
       </div>`
    : ""
        }
      </div>
      <span class="status-badge ${order.status}">
        <i class="ph ph-${statusInfo.icon}"></i>
        ${statusInfo.label}
      </span>
    </div>

    <div class="order-items">${itemsHtml}</div>

    ${catatanHtml}

    <div class="order-card-footer">
      <div class="order-total">${formatRupiah(order.total || 0)}</div>
      <div class="status-actions">
        <button class="btn-status baru    ${order.status === 'baru'      ? 'active' : ''}"
                data-id="${order.id}" data-status="baru">
          <i class="ph ph-clock"></i> Baru
        </button>
        <button class="btn-status diproses ${order.status === 'diproses'  ? 'active' : ''}"
                data-id="${order.id}" data-status="diproses">
          <i class="ph ph-spinner"></i> Diproses
        </button>
        <button class="btn-status selesai  ${order.status === 'selesai'   ? 'active' : ''}"
                data-id="${order.id}" data-status="selesai">
          <i class="ph ph-check-circle"></i> Selesai
        </button>
      </div>
    </div>
  `;

  // Event listener tombol ubah status
  card.querySelectorAll(".btn-status").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.id;
      const status  = btn.dataset.status;

      // Prevent double click
      if (btn.classList.contains("active")) return;

      await updateOrderStatus(orderId, status);
    });
  });

  return card;
}

// ============================================================
// RENDER SEMUA ORDERS BERDASARKAN FILTER
// ============================================================
export function renderOrders(filter = "all") {
  activeFilter = filter;

  if (!ordersList) return;

  loadingState?.classList.add("hidden");

  const filtered =
    filter === "all"
      ? allOrders
      : allOrders.filter((o) => o.status === filter);

  if (filtered.length === 0) {
    ordersList.innerHTML = "";
    emptyState?.classList.remove("hidden");
    return;
  }

  emptyState?.classList.add("hidden");
  ordersList.innerHTML = "";

  filtered.forEach((order, i) => {
    const card = renderOrderCard(order);
    card.style.animationDelay = `${i * 0.05}s`;
    ordersList.appendChild(card);
  });
}

// ============================================================
// FETCH ORDERS DARI FIRESTORE (REALTIME)
// ============================================================
export function fetchOrders() {
  if (!ordersList) return;

  loadingState?.classList.remove("hidden");

  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  // Realtime listener — update otomatis ketika ada order baru/perubahan status
  onSnapshot(
    q,
    (snapshot) => {
      allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      renderOrders(activeFilter);
      updateFilterCounts();
    },
    (error) => {
      console.error("Error fetching orders:", error);
      loadingState?.classList.add("hidden");

      if (ordersList) {
        ordersList.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">⚠️</span>
            <h3>Gagal memuat pesanan</h3>
            <p>Periksa koneksi dan konfigurasi Firebase Anda.</p>
          </div>
        `;
      }
    }
  );
}

// ---- Update angka di tab filter ----
function updateFilterCounts() {
  const counts = {
    all:      allOrders.length,
    baru:     allOrders.filter((o) => o.status === "baru").length,
    diproses: allOrders.filter((o) => o.status === "diproses").length,
    selesai:  allOrders.filter((o) => o.status === "selesai").length,
  };

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const filter = tab.dataset.filter;
    const count  = counts[filter] ?? 0;

    // Simpan teks asli tanpa angka
    const baseText = tab.dataset.label || tab.textContent.replace(/\s*\(\d+\)/, "").trim();
    tab.dataset.label = baseText;
    tab.textContent   = count > 0 ? `${baseText} (${count})` : baseText;
  });
}

// ============================================================
// SETUP FILTER TABS
// ============================================================
function setupFilterTabs() {
  const tabs = document.querySelectorAll(".filter-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderOrders(tab.dataset.filter);
    });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
  setupFilterTabs();
});
