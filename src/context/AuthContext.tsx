import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'auth'

function readStoredAuth() {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(() => readStoredAuth())

  useEffect(() => {
    const handleExpired = () => {
      setAuth(null)
      localStorage.removeItem(STORAGE_KEY)
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [navigate])

  const value = useMemo(() => {
    const login = async (payload) => {
      const response = await authApi.login(payload)
      const nextAuth = response?.data || response
      setAuth(nextAuth)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth))
      return nextAuth
    }

    const logout = () => {
      setAuth(null)
      localStorage.removeItem(STORAGE_KEY)
      navigate('/login', { replace: true })
    }

    return {
      auth,
      token: auth?.token || '',
      username: auth?.username || '',
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }
  }, [auth, navigate])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
