import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const titleMap = {
  '/': 'Dashboard',
  '/buku': 'Buku Publik',
  '/admin/jenis-buku': 'Jenis Buku',
  '/admin/penulis': 'Penulis',
  '/admin/penerbit': 'Penerbit',
  '/admin/peminjaman': 'Peminjaman',
  '/admin/denda': 'Denda',
}

export default function Layout() {
  const { username, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const title =
    titleMap[location.pathname] ||
    (location.pathname.startsWith('/admin/peminjaman/')
      ? 'Detail Peminjaman'
      : location.pathname.startsWith('/buku/')
        ? 'Detail Buku'
        : 'Dashboard')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                {/* Hamburger — visible on mobile only */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                  aria-label="Buka menu navigasi"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                    Perpustakaan
                  </p>
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">{username || 'Admin'}</p>
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

          <div className="min-w-0 min-h-0 flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
