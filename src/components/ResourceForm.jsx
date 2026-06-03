import { useEffect, useMemo, useState } from 'react'

const blankValue = (field) => {
  if (field.type === 'number') return ''
  if (field.type === 'textarea') return ''
  if (field.type === 'datetime') return ''
  if (field.type === 'date') return ''
  return ''
}

const normalizeDateInput = (value, type) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  if (type === 'date') {
    return date.toISOString().slice(0, 10)
  }
  return date.toISOString().slice(0, 16)
}

export default function ResourceForm({ fields, initialValues, onSubmit, onCancel, submitLabel }) {
  const initialState = useMemo(() => {
    const next = {}
    fields.forEach((field) => {
      const raw = initialValues?.[field.name]
      next[field.name] =
        raw !== undefined && raw !== null
          ? field.type === 'date' || field.type === 'datetime'
            ? normalizeDateInput(raw, field.type)
            : String(raw)
          : blankValue(field)
    })
    return next
  }, [fields, initialValues])

  const [values, setValues] = useState(initialState)

  useEffect(() => {
    setValues(initialState)
  }, [initialState])

  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {}
    fields.forEach((field) => {
      const value = values[field.name]
      if (field.type === 'number') {
        payload[field.name] = value === '' ? null : Number(value)
      } else if (field.type === 'datetime' || field.type === 'date') {
        payload[field.name] = value ? new Date(value).toISOString() : ''
      } else {
        payload[field.name] = value
      }
    })
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const inputClass =
            'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          return (
            <label key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  className={`${inputClass} min-h-28`}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type === 'datetime' ? 'datetime-local' : field.type || 'text'}
                  value={values[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  className={inputClass}
                  placeholder={field.placeholder}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                />
              )}
            </label>
          )
        })}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {submitLabel || 'Simpan'}
        </button>
      </div>
    </form>
  )
}
