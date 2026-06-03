import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { bukuApi } from '../api'
import { formatDate, prettyValue } from '../lib/format'

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
}

export default function BukuDetail() {
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['public-book', id],
    queryFn: () => bukuApi.detail(id),
    enabled: Boolean(id),
  })

  if (query.isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-7 w-56" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-3xl" />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
            <Skeleton className="mt-6 h-24" />
          </div>
        </div>
      </section>
    )
  }

  if (query.isError) {
    return (
      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Detail Buku</p>
          <p className="mt-2 text-sm text-red-600">Gagal memuat detail buku. Coba muat ulang halaman.</p>
        </div>
      </section>
    )
  }

  const book = query.data?.data || query.data

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Detail Buku</p>
        <h2 className="text-2xl font-semibold text-slate-900">{book?.judul_buku || '-'}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {book?.gambar_buku ? (
            <img
              src={book.gambar_buku}
              alt={book.judul_buku}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.replaceWith(
                  Object.assign(document.createElement('div'), {
                    className: 'flex h-96 items-center justify-center bg-slate-100 text-slate-400 text-sm',
                    textContent: 'Gambar tidak tersedia',
                  }),
                )
              }}
              className="h-96 w-full object-cover"
            />
          ) : (
            <div className="flex h-96 items-center justify-center bg-slate-100 text-sm text-slate-400">
              Tidak ada gambar
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 md:grid-cols-2">
            {[
              ['ISBN', book?.isbn],
              ['ID Buku', book?.id_buku],
              ['Judul', book?.judul_buku],
              ['Jenis', book?.id_kategori_buku],
              ['Penulis', book?.id_penulis_buku],
              ['Penerbit', book?.id_penerbit_buku],
              ['Tahun Terbit', book?.tahun_terbit],
              ['Stok', book?.stok_buku],
              ['Rak', book?.rak_buku],
              ['Kondisi', book?.kondisi_buku],
              ['Dibuat', formatDate(book?.created_at)],
              ['Diubah', formatDate(book?.updated_at)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{prettyValue(value)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Deskripsi</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{book?.deskripsi_buku || '-'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
