// ============================================================
// js/admin/status.js — Ubah Status Order di Firestore
// ============================================================

import { db } from "../../firebase.js";
import {
  doc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { showAdminToast } from "./dashboard.js";

// ============================================================
// UPDATE STATUS ORDER
// ============================================================

/**
 * Ubah status order di Firestore
 * @param {string} orderId - ID dokumen order
 * @param {string} newStatus - "baru" | "diproses" | "selesai" | "dibatalkan"
 */
export async function updateOrderStatus(orderId, newStatus) {
  // Cari tombol yang diklik dan ubah ke loading state
  const card    = document.getElementById(`order-${orderId}`);
  const buttons = card?.querySelectorAll(".btn-status");

  if (buttons) {
    buttons.forEach((btn) => (btn.disabled = true));
  }

  try {
    const orderRef = doc(db, "orders", orderId);

    // Update field status dan tambahkan timestamp perubahan
    await updateDoc(orderRef, {
      status:    newStatus,
      updatedAt: serverTimestamp(),
    });

    const statusLabels = {
      baru:       "Baru",
      diproses:   "Diproses",
      selesai:    "Selesai",
      dibatalkan: "Dibatalkan",
    };

    showAdminToast(
      `Status diubah ke: ${statusLabels[newStatus] || newStatus}`,
      "success"
    );

    console.log(`Order ${orderId} status → ${newStatus}`);
  } catch (error) {
    console.error("Error updating status:", error);
    showAdminToast("Gagal mengubah status!", "error");
  } finally {
    // Re-enable buttons (UI akan di-update oleh onSnapshot listener)
    if (buttons) {
      buttons.forEach((btn) => (btn.disabled = false));
    }
  }
}

// ============================================================
// BATCH STATUS UPDATE (opsional: gunakan jika perlu)
// ============================================================

/**
 * Ubah status beberapa order sekaligus
 * @param {string[]} orderIds
 * @param {string} newStatus
 */
export async function batchUpdateStatus(orderIds, newStatus) {
  const promises = orderIds.map((id) => updateOrderStatus(id, newStatus));

  try {
    await Promise.all(promises);
    showAdminToast(`${orderIds.length} order diperbarui`, "success");
  } catch (error) {
    console.error("Batch update error:", error);
    showAdminToast("Sebagian update gagal", "error");
  }
}
