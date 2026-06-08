import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bukuApi } from '../api'
import DataTable from '../components/DataTable'
import { publicBookColumns } from '../config/resources'
import { prettyValue } from '../lib/format'

export default function BukuList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: ['public-books'],
    queryFn: bukuApi.list,
  })

  const rows = Array.isArray(query.data?.data) ? query.data.data : []

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return rows

    return rows.filter((row) =>
      publicBookColumns.some((column) =>
        String(prettyValue(row[column.key] ?? '')).toLowerCase().includes(needle),
      ),
    )
  }, [rows, search])

  return (
    <section className="min-w-0 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Katalog publik
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Daftar Buku
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Data buku yang bisa ditinjau staf tanpa masuk ke area admin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, ISBN, atau kode..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition sm:min-w-80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            {filteredRows.length} buku
          </span>
          <span>Gunakan pencarian untuk menyaring koleksi secara cepat.</span>
        </div>
      </div>

      <DataTable
        columns={publicBookColumns}
        rows={filteredRows}
        scrollable
        maxHeightClass="max-h-[calc(100vh-16rem)]"
        isLoading={query.isLoading}
        emptyTitle="Tidak ada buku"
        emptyDescription="Tidak ada buku yang cocok dengan kata kunci pencarian saat ini."
        onView={(row) => {
          navigate(`/buku/${row.id_buku}`)
        }}
      />
    </section>
  )
}
