import { useEffect, useMemo, useState } from 'react'
import {
  normalizeInitialFieldValue,
  validateResourceForm,
  visibleInMode,
} from '../lib/formValidation'

const blankValue = () => ''

export default function ResourceForm({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  mode,
  deriveValues,
}) {
  const initialState = useMemo(() => {
    const next = {}
    fields.forEach((field) => {
      if (!visibleInMode(field, mode)) return
      const raw = initialValues?.[field.name]
      next[field.name] =
        raw !== undefined && raw !== null ? normalizeInitialFieldValue(field, raw) : blankValue()
    })
    return next
  }, [fields, initialValues, mode])

  const [values, setValues] = useState(initialState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setValues(initialState)
    setFieldErrors({})
    setFormError('')
  }, [initialState])

  const handleChange = (name, value) => {
    const derivedPatch = typeof deriveValues === 'function' ? deriveValues(name, value, values) || {} : {}

    setValues((current) => ({
      ...current,
      [name]: value,
      ...derivedPatch,
    }))

    setFieldErrors((current) => {
      const next = { ...current }
      delete next[name]
      Object.keys(derivedPatch).forEach((key) => {
        delete next[key]
      })
      return next
    })
    setFormError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateResourceForm(fields, values, mode)
    setFieldErrors(result.errors)
    setFormError(result.formError)

    if (!result.isValid) return
    onSubmit(result.payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 lg:grid-cols-2">
        {fields.map((field) => {
          if (!visibleInMode(field, mode)) return null

          const inputClass =
            'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          const isReadOnly = field.readOnly || false
          const fieldType =
            field.type === 'datetime'
              ? 'datetime-local'
              : field.type === 'date'
                ? 'date'
                : field.format === 'email'
                  ? 'email'
                  : field.type || 'text'

          return (
            <label key={field.name} className={`${field.fullWidth ? 'lg:col-span-2' : ''} block`}>
              <span className="text-sm font-medium text-slate-800">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  className={`${inputClass} min-h-28`}
                  placeholder={field.placeholder}
                  readOnly={isReadOnly}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  className={inputClass}
                  readOnly={isReadOnly}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  disabled={isReadOnly}
                >
                  <option value="">{field.placeholder || `Pilih ${field.label}`}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type={fieldType}
                    value={values[field.name]}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    className={inputClass}
                    placeholder={field.placeholder}
                    readOnly={isReadOnly}
                    aria-invalid={Boolean(fieldErrors[field.name])}
                    autoComplete={field.format === 'email' ? 'email' : undefined}
                    step={field.type === 'number' ? '1' : undefined}
                    list={field.suggestions?.length ? `${field.name}-suggestions` : undefined}
                  />
                  {field.suggestions?.length ? (
                    <datalist id={`${field.name}-suggestions`}>
                      {field.suggestions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  ) : null}
                </>
              )}
              {fieldErrors[field.name] && (
                <p className="mt-1 text-xs text-[#FF0000]">{fieldErrors[field.name]}</p>
              )}
            </label>
          )
        })}
      </div>

      {formError && (
        <div className="rounded-xl border border-[#FF0000]/20 bg-[#FF0000]/5 px-4 py-3 text-sm text-[#FF0000]">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-xl border border-[#BBD5DA] bg-[#BBD5DA] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#a8c4c9]"
        >
          {submitLabel || 'Simpan'}
        </button>
      </div>
    </form>
  )
}
