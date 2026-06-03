import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api'
import DataTable from './DataTable'
import Modal from './Modal'
import ResourceForm from './ResourceForm'
import { resourceConfigs } from '../config/resources'
import { pickFirst } from '../lib/format'
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../lib/alerts'

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
  const [formOpen, setFormOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const listErrorShownRef = useRef(false)
  const lookupErrorShownRef = useRef({})

  const lookupSources = useMemo(
    () => Array.from(new Set(config.fields.map((field) => field.optionsSource).filter(Boolean))),
    [config.fields],
  )

  const requiresPeminjamanLookup =
    lookupSources.includes('peminjaman') ||
    resourceKey === 'denda' ||
    config.fields.some((field) => field.suggestionSource === 'knownAnggota')

  const peminjamanLookupQuery = useQuery({
    queryKey: ['lookup', 'peminjaman'],
    queryFn: () => api.peminjamanApi.list(),
    enabled: requiresPeminjamanLookup,
  })

  const listQuery = useQuery({
    queryKey: [config.queryKey, search],
    queryFn: () => endpoint.list(search),
  })

  const rows = useMemo(() => {
    const raw = listQuery.data?.data || listQuery.data?.data?.data || listQuery.data?.data || []
    return Array.isArray(raw) ? raw : []
  }, [listQuery.data])

  const peminjamanRows = useMemo(() => {
    const raw =
      peminjamanLookupQuery.data?.data ||
      peminjamanLookupQuery.data?.data?.data ||
      peminjamanLookupQuery.data?.data ||
      []
    return Array.isArray(raw) ? raw : []
  }, [peminjamanLookupQuery.data])

  const createMutation = useMutation({
    mutationFn: endpoint.create,
    onSuccess: async () => {
      await showSuccessAlert('Berhasil', 'Data berhasil disimpan.')
      setFormOpen(false)
      setSelectedRow(null)
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => showErrorAlert('Gagal menyimpan data', error),
  })

  const updateMutation = useMutation({
    mutationFn: endpoint.update,
    onSuccess: async () => {
      await showSuccessAlert('Berhasil', 'Data berhasil diperbarui.')
      setFormOpen(false)
      setSelectedRow(null)
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => showErrorAlert('Gagal memperbarui data', error),
  })

  const deleteMutation = useMutation({
    mutationFn: endpoint.remove,
    onSuccess: async () => {
      await showSuccessAlert('Berhasil', 'Data berhasil dihapus.')
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    onError: (error) => showErrorAlert('Gagal menghapus data', error),
  })

  const openCreate = () => {
    setMode('create')
    setSelectedRow(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setMode('edit')
    setSelectedRow(row)
    setFormOpen(true)
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
    if (resourceKey === 'denda') {
      const selectedId = String(values.id_peminjaman ?? '').trim()
      const selectedRow = peminjamanRows.find(
        (item) => String(item.id ?? item.id_peminjaman ?? '') === selectedId,
      )

      if (!selectedRow?.id_anggota) {
        showErrorAlert(
          'Gagal menyimpan data',
          'ID peminjaman yang dipilih tidak memiliki pasangan ID anggota yang valid.',
        )
        return
      }

      const normalizedValues = {
        ...values,
        id_anggota: String(selectedRow.id_anggota),
      }

      if (mode === 'create') {
        createMutation.mutate(normalizedValues)
        return
      }

      updateMutation.mutate(normalizedValues)
      return
    }

    if (mode === 'create') {
      createMutation.mutate(values)
      return
    }

    updateMutation.mutate(values)
  }

  const handleDelete = (row) => {
    showConfirmAlert('Konfirmasi hapus', `Hapus data ${config.title} ini?`).then((result) => {
      if (!result.isConfirmed) return

      const payload = {
        [config.deletePayloadKey || 'id']: row[config.deletePayloadKey || 'id'] || row.id,
      }

      deleteMutation.mutate(payload)
    })
  }

  const loading =
    listQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const handleView = config.viewPathBuilder
    ? (row) => {
        window.location.href = config.viewPathBuilder(row)
      }
    : undefined

  const lookupOptions = useMemo(() => {
    const peminjamanRaw =
      peminjamanLookupQuery.data?.data ||
      peminjamanLookupQuery.data?.data?.data ||
      peminjamanLookupQuery.data?.data ||
      []

    return {
      peminjaman: Array.isArray(peminjamanRaw)
        ? peminjamanRaw.map((item) => {
            const peminjamanId = String(item.id ?? item.id_peminjaman ?? '')
            return {
              value: peminjamanId,
              label: `${peminjamanId} - ${item.id_anggota || '-'}`,
            }
          })
        : [],
    }
  }, [peminjamanLookupQuery.data])

  const knownAnggotaSuggestions = useMemo(() => {
    const uniqueIds = new Set()
    peminjamanRows.forEach((item) => {
      if (item?.id_anggota) {
        uniqueIds.add(String(item.id_anggota))
      }
    })
    return Array.from(uniqueIds)
  }, [peminjamanRows])

  const fields = useMemo(() => {
    return config.fields.map((field) => {
      const nextField = { ...field }

      if (field.optionsSource) {
        const options = lookupOptions[field.optionsSource] || []
        nextField.options = options
        nextField.allowedValues = options.map((option) => option.value)
      }

      if (field.suggestionSource === 'knownAnggota') {
        nextField.suggestions = knownAnggotaSuggestions
      }

      return nextField
    })
  }, [config.fields, lookupOptions, knownAnggotaSuggestions])

  const lookupReady = lookupSources.every((source) => {
    if (source !== 'peminjaman') return true
    return !peminjamanLookupQuery?.isLoading && !peminjamanLookupQuery?.isError
  })

  useEffect(() => {
    if (!listQuery.isError || !listQuery.error || listErrorShownRef.current) return
    listErrorShownRef.current = true
    showErrorAlert(`Gagal memuat ${config.title}`, listQuery.error)
  }, [config.title, listQuery.error, listQuery.isError])

  useEffect(() => {
    if (!peminjamanLookupQuery?.isError || !peminjamanLookupQuery.error || lookupErrorShownRef.current.peminjaman) {
      return
    }
    lookupErrorShownRef.current.peminjaman = true
    showErrorAlert('Gagal memuat data peminjaman', peminjamanLookupQuery.error)
  }, [peminjamanLookupQuery])

  const deriveValues = (fieldName, value) => {
    if (resourceKey !== 'denda' || fieldName !== 'id_peminjaman') {
      return {}
    }

    const selectedId = String(value ?? '').trim()
    if (!selectedId) {
      return { id_anggota: '' }
    }

    const selectedRow = peminjamanRows.find(
      (item) => String(item.id ?? item.id_peminjaman ?? '') === selectedId,
    )

    return {
      id_anggota: selectedRow?.id_anggota ? String(selectedRow.id_anggota) : '',
    }
  }

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

      <DataTable
        columns={config.columns}
        rows={rows}
        onView={handleView}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {loading && <p className="text-sm text-slate-500">Memuat data...</p>}

      {formOpen && (
        <Modal
          title={mode === 'create' ? `Tambah ${config.title}` : `Edit ${config.title}`}
          onClose={closeForm}
        >
          {!lookupReady ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Memuat data referensi valid...
            </div>
          ) : (
            <ResourceForm
              mode={mode}
              fields={fields}
              initialValues={getInitialValues()}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitLabel={mode === 'create' ? 'Simpan' : 'Perbarui'}
              deriveValues={deriveValues}
            />
          )}
        </Modal>
      )}
    </section>
  )
}
