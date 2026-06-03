import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bukuApi } from '../api'
import DataTable from '../components/DataTable'
import { publicBookColumns } from '../config/resources'

export default function BukuList() {
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['public-books'],
    queryFn: bukuApi.list,
  })

  const rows = Array.isArray(query.data?.data) ? query.data.data : []

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Publik</p>
        <h2 className="text-2xl font-semibold text-slate-900">Daftar Buku</h2>
        <p className="mt-1 text-sm text-slate-600">
          Data buku yang bisa dilihat tanpa autentikasi admin.
        </p>
      </div>

      <DataTable
        columns={publicBookColumns}
        rows={rows}
        onView={(row) => {
          navigate(`/buku/${row.id_buku}`)
        }}
      />

      {query.isLoading && <p className="text-sm text-slate-500">Memuat buku...</p>}
    </section>
  )
}
