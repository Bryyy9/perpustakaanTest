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

export default function Sidebar() {
  return (
    <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 md:flex md:flex-col">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Front Office</p>
        <h2 className="mt-2 text-xl font-semibold">Perpustakaan</h2>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'block rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}
