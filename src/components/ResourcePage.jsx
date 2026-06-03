import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DataTable from './DataTable'
import Modal from './Modal'
import ResourceForm from './ResourceForm'
import { getErrorMessage, pickFirst } from '../lib/format'
import { resourceConfigs } from '../config/resources'
import * as api from '../api'

const apiMap = {
  jenisBukuApi: api.jenisBukuApi,
  penulisApi: api.penulisApi,
  penerbitApi: api.penerbitApi,
  peminjamanApi: api.peminjamanApi,
  dendaApi: api.dendaApi,
}

export default function ResourcePage({ resourceKey }) {
  const config = resourceConfigs[resourceKey]
  const endpoint = apiMap[config.apiKey]
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [message, setMessage] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [mode, setMode] = useState('create')

  const listQuery = useQuery({
    queryKey: [config.queryKey, search],
    queryFn: () => endpoint.list(search),
  })

  const rows = useMemo(() => {
    const raw = listQuery.data?.data || listQuery.data?.data?.data || listQuery.data?.data || []
    return Array.isArray(raw) ? raw : []
  }, [listQuery.data])

  const createMutation = useMutation({
    mutationFn: endpoint.create,
    onSuccess: async () => {
      setMessage({ type: 'success', text: 'Data berhasil disimpan.' })
      setFormOpen(false)
      setSelectedRow(null)
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => setMessage({ type: 'error', text: getErrorMessage(error) }),
  })

  const updateMutation = useMutation({
    mutationFn: endpoint.update,
    onSuccess: async () => {
      setMessage({ type: 'success', text: 'Data berhasil diperbarui.' })
      setFormOpen(false)
      setSelectedRow(null)
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => setMessage({ type: 'error', text: getErrorMessage(error) }),
  })

  const deleteMutation = useMutation({
    mutationFn: endpoint.remove,
    onSuccess: async () => {
      setMessage({ type: 'success', text: 'Data berhasil dihapus.' })
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => setMessage({ type: 'error', text: getErrorMessage(error) }),
  })

  const openCreate = () => {
    setMode('create')
    setSelectedRow(null)
    setFormOpen(true)
    setMessage(null)
  }

  const openEdit = (row) => {
    setMode('edit')
    setSelectedRow(row)
    setFormOpen(true)
    setMessage(null)
  }

  const closeForm = () => {
    setFormOpen(false)
    setSelectedRow(null)
  }

  const getInitialValues = () => {
    if (!selectedRow) return {}
    if (config.mapEditValues) return config.mapEditValues(selectedRow)
    const initial = {}
    config.fields.forEach((field) => {
      initial[field.name] = pickFirst(selectedRow, field.valueKeys || [field.name])
    })
    return initial
  }

  const handleSubmit = (values) => {
    if (mode === 'create') {
      const payload = { ...values }
      if (config.deleteKey && payload[config.deleteKey]) {
        delete payload[config.deleteKey]
      }
      createMutation.mutate(payload)
      return
    }

    const payload = { ...values }
    if (config.deleteKey && !payload[config.deleteKey]) {
      payload[config.deleteKey] = selectedRow?.[config.deleteKey] || selectedRow?.id
    }

    if (resourceKey === 'penulis') {
      payload.id = selectedRow?.id || selectedRow?.id_penulis || payload.id
    } else if (resourceKey === 'penerbit') {
      payload.id = selectedRow?.id || selectedRow?.id_penerbit || payload.id
    } else if (resourceKey === 'jenisBuku') {
      payload.id = selectedRow?.id || payload.id
    }

    updateMutation.mutate(payload)
  }

  const handleDelete = (row) => {
    const confirmed = window.confirm(`Hapus data ${config.title} ini?`)
    if (!confirmed) return

    const payload =
      resourceKey === 'peminjaman'
        ? { id_peminjaman: row.id }
        : resourceKey === 'denda'
          ? { id_denda: row.id_denda }
          : { id: row.id }

    deleteMutation.mutate(payload)
  }

  const loading = listQuery.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const handleView = config.viewPathBuilder
    ? (row) => {
        window.location.href = config.viewPathBuilder(row)
      }
    : undefined

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Admin</p>
          <h2 className="text-2xl font-semibold text-slate-900">{config.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{config.description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {config.queryKey && (
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari data..."
              className="min-w-72 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          )}
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Tambah Data
          </button>
        </div>
      </div>

      {message && (
        <div
          className={[
            'rounded-2xl border px-4 py-3 text-sm',
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      <DataTable
        columns={config.columns}
        rows={rows}
        onView={handleView}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {loading && (
        <p className="text-sm text-slate-500">Memuat data...</p>
      )}

      {formOpen && (
        <Modal
          title={mode === 'create' ? `Tambah ${config.title}` : `Edit ${config.title}`}
          onClose={closeForm}
        >
          <ResourceForm
            fields={config.fields}
            initialValues={getInitialValues()}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitLabel={mode === 'create' ? 'Simpan' : 'Perbarui'}
          />
        </Modal>
      )}
    </section>
  )
}
