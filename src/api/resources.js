import { http } from '../lib/http'

export function createListApi(basePath) {
  return {
    list: async (query = '') => {
      const { data } = await http.get(basePath, {
        params: query ? { q: query } : undefined,
      })
      return data
    },
  }
}

export function createCrudApi(basePath, idField = 'id') {
  return {
    list: async (query = '') => {
      const { data } = await http.get(basePath, {
        params: query ? { q: query } : undefined,
      })
      return data
    },
    detail: async (id) => {
      const { data } = await http.get(`${basePath}/${id}`)
      return data
    },
    create: async (payload) => {
      const { data } = await http.post(`${basePath}/create`, payload)
      return data
    },
    update: async (payload) => {
      const { data } = await http.put(`${basePath}/update`, payload)
      return data
    },
    remove: async (payload) => {
      const { data } = await http.delete(`${basePath}/delete`, {
        data: payload,
      })
      return data
    },
    idField,
  }
}

export const publicBukuApi = {
  list: async () => {
    const { data } = await http.get('/api/v1/buku')
    return data
  },
  detail: async (id) => {
    const { data } = await http.get(`/api/v1/buku/${id}`)
    return data
  },
}
