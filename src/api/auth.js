import { http } from '../lib/http'

export async function login(payload) {
  const { data } = await http.post('/api/v1/login', payload)
  return data
}
