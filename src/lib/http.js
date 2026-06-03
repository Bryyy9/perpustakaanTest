import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    } catch {
      localStorage.removeItem('auth')
    }
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)
