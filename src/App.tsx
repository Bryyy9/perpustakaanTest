import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const Layout = lazy(() => import('./components/Layout'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const BukuList = lazy(() => import('./pages/BukuList'))
const BukuDetail = lazy(() => import('./pages/BukuDetail'))
const JenisBukuPage = lazy(() => import('./pages/admin/JenisBukuPage'))
const PenulisPage = lazy(() => import('./pages/admin/PenulisPage'))
const PenerbitPage = lazy(() => import('./pages/admin/PenerbitPage'))
const PeminjamanPage = lazy(() => import('./pages/admin/PeminjamanPage'))
const PeminjamanDetail = lazy(() => import('./pages/admin/PeminjamanDetail'))
const DendaPage = lazy(() => import('./pages/admin/DendaPage'))

export default function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-500">Memuat halaman...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/buku" element={<BukuList />} />
            <Route path="/buku/:id" element={<BukuDetail />} />
            <Route path="/admin/jenis-buku" element={<JenisBukuPage />} />
            <Route path="/admin/penulis" element={<PenulisPage />} />
            <Route path="/admin/penerbit" element={<PenerbitPage />} />
            <Route path="/admin/peminjaman" element={<PeminjamanPage />} />
            <Route path="/admin/peminjaman/:id" element={<PeminjamanDetail />} />
            <Route path="/admin/denda" element={<DendaPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
