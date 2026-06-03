import { formatDate, prettyValue } from '../lib/format'

export default function DataTable({ columns, rows, onEdit, onDelete, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-slate-500"
              >
                Belum ada data.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id || row.id_denda || row.id_buku || index} className="align-top">
                {columns.map((column) => {
                  const value = column.render
                    ? column.render(row)
                    : row[column.key]
                  return (
                    <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                      {column.type === 'date' ? formatDate(value) : prettyValue(value)}
                    </td>
                  )
                })}
                {(onEdit || onDelete || onView) && (
                  <td className="px-4 py-3">
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
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
