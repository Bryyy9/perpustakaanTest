import { login } from './auth'
import { createCrudApi, publicBukuApi } from './resources'

export const authApi = { login }
export const bukuApi = publicBukuApi

export const jenisBukuApi = createCrudApi('/api/v1/admin/buku/jenbuk', 'id')
export const penulisApi = createCrudApi('/api/v1/admin/buku/author', 'id')
export const penerbitApi = createCrudApi('/api/v1/admin/buku/penbuk', 'id')
export const peminjamanApi = createCrudApi('/api/v1/admin/peminjaman', 'id')
export const dendaApi = createCrudApi('/api/v1/admin/denda', 'id_denda')
