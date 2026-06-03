# 📚 Perpustakaan — Frontend

Frontend admin panel untuk sistem manajemen perpustakaan. Desktop-first, navigasi tetap di kiri, konten scroll di kanan. Dibangun dengan React + Vite + Tailwind CSS v4.

---

## Teknologi

| Lapisan | Pustaka |
|---|---|
| Framework | React 18 |
| Bundler | Vite |
| CSS | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Notifikasi | SweetAlert2 |
| Form | Vanilla React + custom validation |

Tidak ada state management global selain React Context (hanya untuk auth). Tidak ada CSS module — semua styling via Tailwind utility classes.

---

## Palette warna

| Hex | Peran |
|---|---|
| `#BBD5DA` | Tombol utama, border aksen, active indicator sidebar |
| `#DFF1F1` | Background active link sidebar |
| `#F5F5F5` | Background hover (card, sidebar, tombol sekunder) |
| `#FF0000` | Error, tombol hapus, alert destructive |
| `slate` (50–900) | Teks, border, background halaman (netral) |

---

## Struktur halaman & routing

Semua route didefinisikan di `src/App.jsx`:

### Public (tanpa Layout)

| Path | Halaman | Keterangan |
|---|---|---|
| `/login` | Login | Form login pegawai, redirect jika sudah login |

### Protected (dengan Layout + Sidebar)

| Path | Halaman | Tipe |
|---|---|---|
| `/` | Dashboard | Ringkasan + navigasi |
| `/buku` | BukuList | DataTable publik (read-only) |
| `/buku/:id` | BukuDetail | Detail buku |
| `/admin/jenis-buku` | JenisBukuPage | CRUD via ResourcePage |
| `/admin/penulis` | PenulisPage | CRUD via ResourcePage |
| `/admin/penerbit` | PenerbitPage | CRUD via ResourcePage |
| `/admin/peminjaman` | PeminjamanPage | CRUD via ResourcePage |
| `/admin/peminjaman/:id` | PeminjamanDetail | Detail peminjaman + anggota + buku |
| `/admin/denda` | DendaPage | CRUD via ResourcePage |

Struktur Layout:

```
#root
  <AuthProvider>
    <Routes>
      /login  →  <Login />
      /*       →  <ProtectedRoute>
                    <Layout>
                      <Sidebar />           ← fixed, h-screen
                      <main>
                        <header />          ← shrink-0
                        <div flex-1 overflow-y-auto>
                          <Outlet />        ← SCROLL AREA
```

---

## Pendekatan implementasi

### 1. Layout & scrolling

Flex container dikunci `h-screen overflow-hidden`. Sidebar (`h-screen`) tetap diam di kiri. Hanya `<div class="flex-1 overflow-y-auto">` yang scroll.

Header menggunakan `shrink-0` (bukan `sticky`) karena sudah berada di bagian atas area yang tidak scroll.

### 2. Sidebar navigasi

Menggunakan `NavLink` dari React Router. Active link punya indikator visual:
- Border kiri `#BBD5DA` tebal 3px
- Background `#DFF1F1`
- Teks `#4a6a70`

Hover link menggunakan background `#F5F5F5`.

### 3. CRUD generik (ResourcePage + ResourceForm)

Lima entitas admin (jenis buku, penulis, penerbit, peminjaman, denda) memakai **satu komponen yang sama**: `ResourcePage`.

Perbedaan tiap entitas dikonfigurasi di `src/config/resources.js`:
- Kolom tabel
- Field form (tipe, validasi, visibility per mode)
- Mapping data ke API
- Relasi lookup (peminjaman → anggota)

`ResourceForm` men-generate form field secara dinamis berdasarkan konfigurasi. Mendukung:
- Text, number, textarea, select, datetime, date
- Validasi client-side (`minLength`, `format: 'email'`, required)
- Visibility per mode (`modes: ['create']` / `modes: ['edit']`)
- Derived values (id_anggota terisi otomatis saat pilih peminjaman di form denda)
- Suggestions untuk field ID anggota

### 4. DataTable

Komponen tabel generik dengan fitur:
- Pagination (client-side)
- Pilihan jumlah baris per halaman (10/25/50)
- Mode scrollable dengan max-height + sticky header
- Skeleton loading
- Empty state
- Tombol aksi (Detail / Edit / Hapus)

### 5. Dashboard

Layout atipikal — tidak menggunakan grid card seragam:
- Summary bar di atas (angka total record)
- Grid kartu dengan border-top aksen `#BBD5DA`, masing-masing menuju halaman terkait
- "Shortcut kerja": daftar navigasi cepat
- Aside: panduan kerja + status tampilan

Data dimuat paralel via `useQueries` dari TanStack Query.

### 6. Validasi form

Form validation logic dipisah di `src/lib/formValidation.js`:
- `validateResourceForm` — validasi CRUD fields (required, minLength, email, number, select)
- `validateLoginForm` — validasi login (username + password required)
- Error per-field ditampilkan dengan teks merah `#FF0000`
- Form-level error box di atas tombol submit

### 7. Autentikasi

Auth state disimpan di React Context (`AuthContext`) + localStorage. Token otomatis dikirim via Axios interceptor (`src/lib/http.js`). Jika response 401, dispatch event `auth:expired` yang memicu logout otomatis.

`ProtectedRoute` mengecek `isAuthenticated` — redirect ke `/login` jika tidak valid.

### 8. Notifikasi

Semua feedback (sukses/error/konfirmasi) menggunakan SweetAlert2 via `src/lib/alerts.js`:
- `showSuccessAlert` — operasi berhasil
- `showErrorAlert` — operasi gagal (parse error message dari API response)
- `showConfirmAlert` — konfirmasi sebelum hapus

Error message dari backend diparse di `getApiErrorMessage` untuk menampilkan pesan yang ramah (termasuk pesan spesifik untuk foreign key constraint `id_anggota` / `id_peminjaman`).

---

## Struktur direktori

```
src/
├── api/
│   ├── index.js              # Inisialisasi semua API endpoint
│   ├── auth.js               # Login API
│   └── resources.js          # Factory createCrudApi / createListApi
├── components/
│   ├── DataTable.jsx          # Tabel generik (pagination, scroll, skeleton)
│   ├── Layout.jsx             # Layout utama (sidebar + header + konten)
│   ├── Modal.jsx              # Modal dialog
│   ├── ProtectedRoute.jsx     # Route guard autentikasi
│   ├── ResourceForm.jsx       # Form generik (dinamis berdasarkan config)
│   ├── ResourcePage.jsx       # Halaman CRUD generik
│   └── Sidebar.jsx            # Navigasi sidebar
├── config/
│   └── resources.js           # Konfigurasi tiap entitas (kolom, field, mapping)
├── context/
│   └── AuthContext.jsx        # Auth state (token, username, login, logout)
├── hooks/
│   └── useAuth.js             # Re-export useAuth dari context
├── lib/
│   ├── alerts.js              # SweetAlert2 wrappers
│   ├── format.js              # Utility format (date, number, dll)
│   ├── formValidation.js      # Validasi form resource + login
│   └── http.js                # Axios instance + interceptor token
├── pages/
│   ├── admin/
│   │   ├── DendaPage.jsx
│   │   ├── JenisBukuPage.jsx
│   │   ├── PeminjamanDetail.jsx
│   │   ├── PeminjamanPage.jsx
│   │   ├── PenerbitPage.jsx
│   │   └── PenulisPage.jsx
│   ├── BukuDetail.jsx
│   ├── BukuList.jsx
│   ├── Dashboard.jsx
│   └── Login.jsx
├── App.jsx                    # Routing
├── index.css                  # Tailwind + global styles
└── main.jsx                   # Entry point
```

---

## Menjalankan

```bash
npm install
npm run dev
```

Server development berjalan di `http://localhost:5173` (default Vite).

Backend API harus berjalan di `http://localhost:8001` (bisa dikonfigurasi di `.env`).

---

## Integrasi backend

Frontend terhubung ke REST API Golang (`Golang-Perpustakaan-Restful-API`) dengan base path `/api/v1`:

| Entitas | Endpoints |
|---|---|
| Auth | `POST /api/v1/login` |
| Buku (public) | `GET /api/v1/buku`, `GET /api/v1/buku/:id` |
| Jenis Buku | CRUD `/api/v1/admin/buku/jenbuk` |
| Penulis | CRUD `/api/v1/admin/buku/author` |
| Penerbit | CRUD `/api/v1/admin/buku/penbuk` |
| Peminjaman | CRUD `/api/v1/admin/peminjaman` |
| Denda | CRUD `/api/v1/admin/denda` |

Semua request ke endpoint admin memerlukan header `Authorization: Bearer <token>` yang otomatis dilampirkan oleh Axios interceptor.
