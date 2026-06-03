import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { username, logout } = useAuth()
  const location = useLocation()
  const titleMap = {
    '/': 'Dashboard',
    '/buku': 'Buku Publik',
    '/admin/jenis-buku': 'Jenis Buku',
    '/admin/penulis': 'Penulis',
    '/admin/penerbit': 'Penerbit',
    '/admin/peminjaman': 'Peminjaman',
    '/admin/denda': 'Denda',
  }

  const title =
    titleMap[location.pathname] ||
    (location.pathname.startsWith('/admin/peminjaman/')
      ? 'Detail Peminjaman'
      : location.pathname.startsWith('/buku/')
        ? 'Detail Buku'
        : 'Dashboard')

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-slate-500">Perpustakaan</p>
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{username || 'Admin'}</p>
                  <p className="text-xs text-slate-500">Session aktif</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
