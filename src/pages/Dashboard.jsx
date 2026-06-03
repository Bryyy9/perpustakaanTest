import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { bukuApi, dendaApi, jenisBukuApi, peminjamanApi, penerbitApi, penulisApi } from '../api'
import { formatNumber } from '../lib/format'

const cards = [
  { label: 'Buku Publik', to: '/buku', query: bukuApi.list },
  { label: 'Jenis Buku', to: '/admin/jenis-buku', query: jenisBukuApi.list },
  { label: 'Penulis', to: '/admin/penulis', query: penulisApi.list },
  { label: 'Penerbit', to: '/admin/penerbit', query: penerbitApi.list },
  { label: 'Peminjaman', to: '/admin/peminjaman', query: peminjamanApi.list },
  { label: 'Denda', to: '/admin/denda', query: dendaApi.list },
]

function getCount(result) {
  const data = result?.data?.data
  if (Array.isArray(data)) return data.length
  if (Array.isArray(result?.data)) return result.data.length
  return 0
}

export default function Dashboard() {
  const results = useQueries({
    queries: cards.map((card) => ({
      queryKey: ['dashboard', card.label],
      queryFn: card.query,
    })),
  })

  const totalLoaded = results.reduce((sum, result) => sum + getCount(result), 0)

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Overview operasional
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard Perpustakaan
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ringkasan cepat untuk memantau data buku, peminjaman, dan denda tanpa elemen visual
              yang berlebihan.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Total record terbaca
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(totalLoaded)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, index) => {
              const result = results[index]
              const count = getCount(result)

              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="rounded-2xl border border-slate-200 border-t-4 border-t-[#BBD5DA] bg-white p-5 shadow-sm transition hover:border-[#BBD5DA] hover:bg-[#F5F5F5]"
                >
                  <p className="text-sm font-medium text-slate-600">{card.label}</p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold tracking-tight text-slate-900">
                        {result.isLoading ? '-' : formatNumber(count)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {result.isLoading ? 'Memuat data' : 'Record aktif'}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      Buka
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Shortcut kerja</p>
              <p className="mt-1 text-sm text-slate-500">
                Akses cepat ke modul yang paling sering dipakai.
              </p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                ['Tambah peminjaman', '/admin/peminjaman'],
                ['Kelola denda', '/admin/denda'],
                ['Verifikasi buku publik', '/buku'],
                ['Atur jenis buku', '/admin/jenis-buku'],
              ].map(([label, to]) => (
                <Link
                  key={label}
                  to={to}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#BBD5DA] hover:bg-[#F5F5F5] hover:text-[#4a6a70]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Panduan kerja</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>Gunakan tabel untuk edit cepat data yang sudah ada.</li>
              <li>Gunakan pencarian sebelum membuka detail.</li>
              <li>Pastikan field ID terisi sesuai referensi yang valid.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Status tampilan</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ['Layout', 'Desktop-first'],
                ['Warna', 'Netral + teal aksen'],
                ['Aksen', '#BBD5DA / #DFF1F1'],
                ['Efek', 'Minimal dan fungsional'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
