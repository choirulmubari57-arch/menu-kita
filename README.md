# 🍜 DapurKita — Website Menu Makanan Online

Website pemesanan makanan online berbasis Firebase Firestore dengan tampilan modern dan responsif.

---

## 📁 Struktur Folder

```
project/
│
├── index.html              ← Halaman utama (menu customer)
├── firebase.js             ← Konfigurasi Firebase
├── README.md
│
├── assets/
│   └── images/             ← Gambar menu (opsional)
│
├── css/
│   ├── customer.css        ← Style halaman customer
│   └── admin.css           ← Style halaman admin
│
├── js/
│   ├── customer/
│   │   ├── menu.js         ← Fetch & tampilkan menu
│   │   ├── cart.js         ← Manajemen keranjang (localStorage)
│   │   └── checkout.js     ← Submit order ke Firestore
│   │
│   └── admin/
│       ├── dashboard.js    ← Statistik & helper
│       ├── orders.js       ← Fetch & tampilkan orders
│       └── status.js       ← Update status order
│
├── pages/
│   ├── cart.html           ← Halaman keranjang
│   ├── checkout.html       ← Form checkout
│   └── success.html        ← Halaman sukses
│
└── admin/
    ├── index.html          ← Dashboard admin
    ├── orders.html         ← Kelola pesanan
    └── login.html          ← Login admin
```

---

## 🚀 Cara Setup

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **Add project** → Beri nama project
3. Aktifkan **Google Analytics** (opsional)

### 2. Setup Firestore

1. Di sidebar Firebase Console, pilih **Firestore Database**
2. Klik **Create database**
3. Pilih mode **Production** atau **Test**
4. Pilih region terdekat (asia-southeast1 untuk Indonesia)

### 3. Setup Authentication

1. Di sidebar, pilih **Authentication** → **Sign-in method**
2. Aktifkan **Email/Password**
3. Buat akun admin di tab **Users** → **Add user**

### 4. Konfigurasi Firebase

Edit file `firebase.js` dan ganti dengan config Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Config bisa didapat di: **Firebase Console → Project Settings → Your apps → Add app (Web)**

### 5. Isi Data Menu di Firestore

Buka **Firestore → Collection: `menu`** → Tambah dokumen:

```
Collection: menu
Document ID: (auto)
Fields:
  - nama       : string  → "Nasi Goreng Spesial"
  - harga      : number  → 25000
  - kategori   : string  → "makanan"  (makanan/minuman/snack/dessert)
  - deskripsi  : string  → "Nasi goreng dengan telur dan ayam"
  - gambar     : string  → "https://..." (URL gambar, opsional)
  - urutan     : number  → 1  (urutan tampil di menu)
```

### 6. Firestore Security Rules

Di **Firestore → Rules**, ganti dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Menu: siapa saja bisa baca, hanya admin yang bisa tulis
    match /menu/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders: siapa saja bisa buat order, hanya admin yang bisa update
    match /orders/{docId} {
      allow create: if true;
      allow read, update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

---

## 🌐 Deploy ke GitHub Pages

1. Upload semua file ke repository GitHub
2. Buka **Settings → Pages**
3. Source: **Deploy from a branch → main → / (root)**
4. Website akan live di: `https://username.github.io/repo-name`

> ⚠️ **Catatan:** Firebase modular menggunakan `import` ES Modules.
> GitHub Pages mendukung ini langsung tanpa build tool.

---

## 🔑 Akses Admin

- URL: `https://yoursite.com/admin/login.html`
- Login dengan email & password yang dibuat di Firebase Authentication

---

## 📱 Fitur

### Customer
- ✅ Menu dari Firestore (realtime)
- ✅ Filter kategori
- ✅ Keranjang belanja (localStorage)
- ✅ Tambah/kurangi/hapus item
- ✅ Checkout form (nama, WhatsApp, catatan)
- ✅ Simpan order ke Firestore
- ✅ Halaman sukses dengan nomor order
- ✅ Responsif mobile

### Admin
- ✅ Login dengan Firebase Auth
- ✅ Dashboard statistik realtime
- ✅ Daftar semua pesanan (realtime)
- ✅ Filter order by status
- ✅ Ubah status order (Baru → Diproses → Selesai)
- ✅ Link WhatsApp pelanggan
- ✅ Sidebar responsif (mobile)

---

## 🛠️ Teknologi

- HTML5, CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES Modules)
- Firebase v10 (Firestore, Authentication)
- Google Fonts (Playfair Display + DM Sans)
- Phosphor Icons

---

## 📝 Lisensi

MIT License — Bebas digunakan dan dimodifikasi.
