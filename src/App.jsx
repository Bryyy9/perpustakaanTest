import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BukuList from './pages/BukuList'
import BukuDetail from './pages/BukuDetail'
import JenisBukuPage from './pages/admin/JenisBukuPage'
import PenulisPage from './pages/admin/PenulisPage'
import PenerbitPage from './pages/admin/PenerbitPage'
import PeminjamanPage from './pages/admin/PeminjamanPage'
import PeminjamanDetail from './pages/admin/PeminjamanDetail'
import DendaPage from './pages/admin/DendaPage'

export default function App() {
  return (
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
  )
}
