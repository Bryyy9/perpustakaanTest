import { useEffect, useMemo, useState } from 'react'
import { formatDate, prettyValue } from '../lib/format'

function getRowKey(row, index) {
  return row.id || row.id_denda || row.id_buku || row.id_peminjaman || index
}

function getSkeletonRows(count) {
  return Array.from({ length: count }, (_, index) => index)
}

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  onView,
  scrollable = false,
  maxHeightClass = 'max-h-[70vh]',
  isLoading = false,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data yang cocok belum tersedia untuk ditampilkan.',
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalRows = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  useEffect(() => {
    setPage(1)
  }, [rows, pageSize])

  const visibleRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  const paginatedRows = isLoading ? getSkeletonRows(Math.min(pageSize, 8)) : visibleRows

  const wrapperClassName =
    'w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'

  const showPagination = !isLoading && totalRows > pageSize
  const headerClassName = scrollable
    ? 'sticky top-0 z-10 bg-slate-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'
    : 'bg-slate-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'
  const actionHeaderClassName = scrollable
    ? 'sticky top-0 z-10 bg-slate-50 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'
    : 'bg-slate-50 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'

  return (
    <section className={wrapperClassName}>
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Daftar data</p>
          <p className="text-xs text-slate-500">
            {isLoading
              ? 'Memuat data...'
              : totalRows === 0
                ? 'Tidak ada baris yang cocok.'
                : `Menampilkan ${Math.min((page - 1) * pageSize + 1, totalRows)}–${Math.min(
                    page * pageSize,
                    totalRows,
                  )} dari ${totalRows} baris`}
          </p>
        </div>

        {!isLoading && totalRows > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span>Baris</span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {showPagination && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <span className="min-w-20 text-center text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {totalRows === 0 && !isLoading ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10">
            <p className="text-base font-medium text-slate-900">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        <div
          className={
            scrollable
              ? `max-w-full overflow-x-auto overflow-y-auto ${maxHeightClass}`
              : 'max-w-full overflow-x-auto'
          }
        >
          <table className="min-w-max w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={headerClassName}
                  >
                    {column.label}
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className={actionHeaderClassName}>
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading
                ? getSkeletonRows(Math.max(5, Math.min(pageSize, 8))).map((index) => (
                    <tr key={index} className="animate-pulse">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-4">
                          <div className="h-3 rounded-full bg-slate-200" />
                        </td>
                      ))}
                      {(onEdit || onDelete || onView) && (
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <div className="h-8 w-16 rounded-lg bg-slate-200" />
                            <div className="h-8 w-16 rounded-lg bg-slate-200" />
                            <div className="h-8 w-16 rounded-lg bg-slate-200" />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                : paginatedRows.map((row, index) => (
                    <tr key={getRowKey(row, index)} className="align-top hover:bg-slate-50/70">
                      {columns.map((column) => {
                        const value = column.render ? column.render(row) : row[column.key]
                        return (
                          <td
                            key={column.key}
                            className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
                          >
                            {column.type === 'date' ? formatDate(value) : prettyValue(value)}
                          </td>
                        )
                      })}
                      {(onEdit || onDelete || onView) && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {onView && (
                              <button
                                type="button"
                                onClick={() => onView(row)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Detail
                              </button>
                            )}
                            {onEdit && (
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(row)}
                                className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
