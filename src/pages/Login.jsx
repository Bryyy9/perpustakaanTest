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
    <div className="flex min-h-screen bg-slate-50 p-4 text-slate-900">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between border-r border-slate-200 bg-slate-50 p-10 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Library OS
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Panel kerja perpustakaan
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Masuk untuk mengelola buku, peminjaman, dan denda dalam tampilan yang sederhana,
              padat, dan mudah dipakai setiap hari.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-600">
            {[
              'Pencarian cepat dan tabel yang mudah dipindai',
              'Form operasional dengan validasi yang jelas',
              'Navigasi desktop-first untuk kerja harian',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Masuk
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Login ke dashboard
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gunakan kredensial pegawai untuk mengakses area admin.
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
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
