import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateLoginForm } from '../lib/formValidation'
import { showErrorAlert, showSuccessAlert } from '../lib/alerts'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    const result = validateLoginForm(form)
    if (!result.isValid) {
      setFieldErrors(result.errors)
      setError(result.formError)
      setLoading(false)
      return
    }

    try {
      await login(result.payload)
      await showSuccessAlert('Berhasil', 'Login berhasil.')
      navigate('/', { replace: true })
    } catch (err) {
      await showErrorAlert('Login gagal', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-600">
            Perpustakaan
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Masuk ke dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Gunakan kredensial pegawai untuk mengelola data perpustakaan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <input
              value={form.username}
              onChange={(event) => {
                setForm((current) => ({ ...current, username: event.target.value }))
                setFieldErrors((current) => {
                  if (!current.username) return current
                  const next = { ...current }
                  delete next.username
                  return next
                })
                setError('')
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              aria-invalid={Boolean(fieldErrors.username)}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.username}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }))
                setFieldErrors((current) => {
                  if (!current.password) return current
                  const next = { ...current }
                  delete next.password
                  return next
                })
                setError('')
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
            )}
          </label>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
