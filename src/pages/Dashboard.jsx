import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { bukuApi, dendaApi, jenisBukuApi, peminjamanApi, penerbitApi, penulisApi } from '../api'

const cards = [
  { label: 'Buku Publik', to: '/buku', query: bukuApi.list },
  { label: 'Jenis Buku', to: '/admin/jenis-buku', query: jenisBukuApi.list },
  { label: 'Penulis', to: '/admin/penulis', query: penulisApi.list },
  { label: 'Penerbit', to: '/admin/penerbit', query: penerbitApi.list },
  { label: 'Peminjaman', to: '/admin/peminjaman', query: peminjamanApi.list },
  { label: 'Denda', to: '/admin/denda', query: dendaApi.list },
]

export default function Dashboard() {
  const results = useQueries({
    queries: cards.map((card) => ({
      queryKey: ['dashboard', card.label],
      queryFn: card.query,
    })),
  })

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-slate-900 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-100">Overview</p>
        <h2 className="mt-3 text-3xl font-bold">Dashboard Perpustakaan</h2>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">
          Akses cepat ke data buku publik, taxonomy buku, peminjaman, dan denda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => {
          const result = results[index]
          const count = Array.isArray(result.data?.data) ? result.data.data.length : 0

          return (
            <Link
              key={card.label}
              to={card.to}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {result.isLoading ? '...' : count}
                  </p>
                  <p className="text-sm text-slate-500">record terdeteksi</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Lihat data
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
