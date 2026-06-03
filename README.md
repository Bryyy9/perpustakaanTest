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

Warna didefinisikan sebagai CSS custom properties di `src/index.css` via `@theme` (Tailwind v4):

| Token | Hex | Peran |
|---|---|---|
| `primary` | `#BBD5DA` | Tombol utama, border aksen, active indicator sidebar |
| `primary-light` | `#DFF1F1` | Background active link sidebar |
| `primary-hover` | `#a8c4c9` | Hover tombol utama |
| `primary-text` | `#4a6a70` | Teks aksen |
| `danger` | `#FF0000` | Error, tombol hapus, alert destructive |
| `surface-hover` | `#F5F5F5` | Background hover (card, sidebar, tombol sekunder) |
| `slate` (50–900) | — | Teks, border, background halaman (netral) |

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
                      <Sidebar />           ← fixed, h-screen (drawer di mobile)
                      <main>
                        <header />          ← shrink-0, berisi hamburger di mobile
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
- Border kiri `primary` tebal 3px
- Background `primary-light`
- Teks `primary-text`

Di layar `md` ke atas, sidebar muncul sebagai panel tetap di kiri. Di bawah `md`, sidebar disembunyikan dan dapat dibuka via tombol hamburger di header — muncul sebagai drawer overlay dengan backdrop. Menutup otomatis saat link diklik atau tombol Escape ditekan.

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
- `omitWhenEmpty: true` — field opsional tidak dikirim ke API jika kosong
- Derived values (id_anggota terisi otomatis saat pilih peminjaman di form denda)
- Suggestions untuk field ID anggota

Search input menggunakan debounce 300ms sebelum mengirim request ke API.

### 4. DataTable

Komponen tabel generik dengan fitur:
- Pagination (client-side)
- Pilihan jumlah baris per halaman (10/25/50)
- Mode scrollable dengan max-height + sticky header
- Skeleton loading
- Empty state
- Tombol aksi (Detail / Edit / Hapus)

### 5. Modal

Modal dialog dengan aksesibilitas penuh:
- Tombol × untuk menutup
- Klik backdrop untuk menutup
- Escape key untuk menutup
- Focus trap (Tab / Shift+Tab terkurung di dalam modal)
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`

### 6. Dashboard

Layout atipikal — tidak menggunakan grid card seragam:
- Summary bar di atas (angka total record)
- Grid kartu dengan border-top aksen `primary`, masing-masing menuju halaman terkait
- "Shortcut kerja": daftar navigasi cepat
- Aside: panduan kerja + status tampilan

Data dimuat paralel via `useQueries` dari TanStack Query.

### 7. Validasi form

Form validation logic dipisah di `src/lib/formValidation.js`:
- `validateResourceForm` — validasi CRUD fields (required, minLength, email, number, select, omitWhenEmpty)
- `validateLoginForm` — validasi login (username + password required)
- Error per-field ditampilkan dengan teks merah
- Form-level error box di atas tombol submit
- Field number menerima nilai 0 sebagai valid

### 8. Autentikasi

Auth state disimpan di React Context (`AuthContext`) + localStorage. Token otomatis dikirim via Axios interceptor (`src/lib/http.js`). Jika response 401, dispatch event `auth:expired` yang memicu logout otomatis.

`ProtectedRoute` mengecek `isAuthenticated` — redirect ke `/login` jika tidak valid.

Form login memiliki `autoComplete="username"` dan `autoComplete="current-password"` untuk mendukung password manager.

### 9. Notifikasi

Semua feedback (sukses/error/konfirmasi) menggunakan SweetAlert2 via `src/lib/alerts.js`:
- `showSuccessAlert` — operasi berhasil
- `showErrorAlert` — operasi gagal (parse error message dari API response)
- `showConfirmAlert` — konfirmasi sebelum hapus

Error message dari backend diparse di `getApiErrorMessage` untuk menampilkan pesan yang ramah (termasuk pesan spesifik untuk foreign key constraint `id_anggota` / `id_peminjaman`).

### 10. Loading & error state

Halaman detail (`BukuDetail`, `PeminjamanDetail`) menampilkan skeleton penuh saat loading dan pesan error eksplisit jika fetch gagal — bukan teks kecil di bawah konten kosong.

---

## Struktur direktori

```
src/
├── api/
│   ├── index.js              # Inisialisasi semua API endpoint
│   ├── auth.js               # Login API
│   └── resources.js          # Factory createCrudApi
├── components/
│   ├── DataTable.jsx          # Tabel generik (pagination, scroll, skeleton)
│   ├── Layout.jsx             # Layout utama (sidebar + header + konten)
│   ├── Modal.jsx              # Modal dialog (aksesibel, focus trap)
│   ├── ProtectedRoute.jsx     # Route guard autentikasi
│   ├── ResourceForm.jsx       # Form generik (dinamis berdasarkan config)
│   ├── ResourcePage.jsx       # Halaman CRUD generik
│   └── Sidebar.jsx            # Navigasi sidebar (desktop panel + mobile drawer)
├── config/
│   └── resources.js           # Konfigurasi tiap entitas (kolom, field, mapping)
├── context/
│   └── AuthContext.jsx        # Auth state (token, username, login, logout)
├── hooks/
│   └── useDebounce.js         # Debounce hook untuk search input
├── lib/
│   ├── alerts.js              # SweetAlert2 wrappers
│   ├── format.js              # Utility format (date, number, extractList, dll)
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
├── index.css                  # Tailwind + @theme (custom color tokens) + global styles
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
