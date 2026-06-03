const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

function trimText(value) {
  return String(value ?? '').trim()
}

function visibleInMode(field, mode) {
  if (!field.modes || field.modes.length === 0) return true
  return field.modes.includes(mode)
}

function normalizeDateTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function normalizeDateInputValue(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeDateTimeInputValue(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function validateField(field, rawValue, mode) {
  if (!visibleInMode(field, mode)) {
    return { skip: true }
  }

  const fieldType = field.type || 'text'

  if (fieldType === 'number') {
    if (isBlank(rawValue)) {
      if (field.required) return { error: `${field.label} wajib diisi.` }
      return { skip: true }
    }

    const normalized = String(rawValue).trim()
    if (!/^\d+$/.test(normalized)) {
      return { error: `${field.label} harus berupa angka bulat positif.` }
    }

    const value = Number(normalized)
    if (!Number.isSafeInteger(value) || value <= 0) {
      return { error: `${field.label} harus berupa angka bulat positif.` }
    }

    return { value }
  }

  if (fieldType === 'select') {
    const value = trimText(rawValue)

    if (field.required && value === '') {
      return { error: `${field.label} wajib diisi.` }
    }

    if (!field.required && value === '') {
      return { skip: true }
    }

    const allowedValues = Array.isArray(field.allowedValues) ? field.allowedValues : []
    if (allowedValues.length > 0 && !allowedValues.includes(value)) {
      return { error: `${field.label} harus dipilih dari daftar yang tersedia.` }
    }

    return { value }
  }

  if (fieldType === 'datetime' || fieldType === 'date') {
    if (isBlank(rawValue)) {
      if (field.required) return { error: `${field.label} wajib diisi.` }
      return { skip: true }
    }

    const value = normalizeDateTime(rawValue)
    if (!value) {
      return { error: `${field.label} tidak valid.` }
    }

    return { value }
  }

  const value = trimText(rawValue)
  if (field.required && value === '') {
    return { error: `${field.label} wajib diisi.` }
  }

  if (!field.required && value === '') {
    return { skip: true }
  }

  if (typeof field.minLength === 'number' && value.length < field.minLength) {
    return { error: `${field.label} minimal ${field.minLength} karakter.` }
  }

  if (field.format === 'email' && !EMAIL_PATTERN.test(value)) {
    return { error: `${field.label} harus berupa email yang valid.` }
  }

  return { value }
}

export function normalizeInitialFieldValue(field, rawValue) {
  if (rawValue === null || rawValue === undefined) return ''

  if (field.type === 'date') {
    return normalizeDateInputValue(rawValue)
  }

  if (field.type === 'datetime') {
    return normalizeDateTimeInputValue(rawValue)
  }

  return String(rawValue)
}

export function validateResourceForm(fields, values, mode) {
  const payload = {}
  const errors = {}

  fields.forEach((field) => {
    const result = validateField(field, values[field.name], mode)
    if (result.skip) return
    if (result.error) {
      errors[field.name] = result.error
      return
    }

    payload[field.name] = result.value
  })

  return {
    isValid: Object.keys(errors).length === 0,
    payload,
    errors,
    formError: Object.keys(errors).length > 0 ? 'Periksa isian yang ditandai.' : '',
  }
}

export function validateLoginForm(values) {
  const errors = {}
  const username = trimText(values.username)
  const password = String(values.password ?? '')

  if (username === '') {
    errors.username = 'Username wajib diisi.'
  }

  if (password.trim() === '') {
    errors.password = 'Password wajib diisi.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    payload: {
      username,
      password,
    },
    errors,
    formError: Object.keys(errors).length > 0 ? 'Periksa username dan password.' : '',
  }
}

export { visibleInMode, normalizeDateTimeInputValue, normalizeDateInputValue }
