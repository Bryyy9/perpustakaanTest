import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { peminjamanApi } from '../../api'
import { formatDate, prettyValue } from '../../lib/format'

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
}

export default function PeminjamanDetail() {
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['peminjaman-detail', id],
    queryFn: () => peminjamanApi.detail(id),
    enabled: Boolean(id),
  })

  if (query.isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="mb-2 h-3 w-28" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-5 w-36" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }, (_, j) => <Skeleton key={j} className="h-16" />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (query.isError) {
    return (
      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Detail Peminjaman</p>
          <p className="mt-2 text-sm text-red-600">Gagal memuat detail peminjaman. Coba muat ulang halaman.</p>
        </div>
      </section>
    )
  }

  const detail = query.data?.data || query.data

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Detail Peminjaman</p>
        <h2 className="text-2xl font-semibold text-slate-900">{prettyValue(detail?.id)}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Informasi Utama</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ['ID Peminjaman', detail?.id],
              ['ID Anggota', detail?.id_anggota || detail?.anggota?.id_anggota],
              ['Nama Anggota', detail?.anggota?.nama],
              ['Tanggal Pinjam', formatDate(detail?.tgl_pinjam)],
              ['Tanggal Harus Kembali', formatDate(detail?.tgl_hrs_kembali)],
              ['Jaminan', detail?.jaminan],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{prettyValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detail Buku</h3>
          <div className="mt-4 space-y-3">
            {(detail?.details || []).map((item, index) => (
              <div key={item.id_detailpinjam || index} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">{item.id_buku}</p>
                <p className="text-xs text-slate-500">Kondisi: {item.kondisi}</p>
              </div>
            ))}
            {(detail?.details || []).length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada detail buku.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
