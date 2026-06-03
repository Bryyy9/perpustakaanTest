import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/buku', label: 'Buku Publik' },
  { to: '/admin/jenis-buku', label: 'Jenis Buku' },
  { to: '/admin/penulis', label: 'Penulis' },
  { to: '/admin/penerbit', label: 'Penerbit' },
  { to: '/admin/peminjaman', label: 'Peminjaman' },
  { to: '/admin/denda', label: 'Denda' },
]

function NavContent({ onNavigate }) {
  return (
    <>
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Library OS
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">Perpustakaan</h2>
        <p className="mt-1 text-sm text-slate-500">Operasional harian staf</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Menu utama
        </div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'block rounded-xl border-l-[3px] px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'border-l-primary border-slate-200 bg-primary-light text-primary-text'
                    : 'border-l-transparent border-transparent text-slate-600 hover:border-l-primary-light hover:border-slate-200 hover:bg-surface-hover hover:text-primary-text',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Tip kerja</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Gunakan halaman admin untuk input data, lalu halaman publik untuk verifikasi cepat buku.
          </p>
        </div>
      </nav>
    </>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen, onClose])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-72 flex-shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900 md:flex">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col overflow-y-auto bg-white text-slate-900 shadow-xl">
            <NavContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}
