import Swal from 'sweetalert2'

export function getApiErrorMessage(error) {
  const responseData = error?.response?.data
  const rawMessage =
    responseData?.msg ||
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    'Terjadi kesalahan tidak diketahui'

  const lowerMessage = String(rawMessage).toLowerCase()
  if (lowerMessage.includes('error 1452') || lowerMessage.includes('foreign key constraint fails')) {
    if (lowerMessage.includes('id_anggota')) {
      return 'ID anggota tidak valid atau belum terdaftar.'
    }
    if (lowerMessage.includes('id_peminjaman')) {
      return 'ID peminjaman tidak valid atau belum terdaftar.'
    }
    if (lowerMessage.includes('id_denda')) {
      return 'Data denda tidak valid.'
    }
  }

  return (
    rawMessage
  )
}

export function showSuccessAlert(title, text) {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#0d9488',
  })
}

export function showErrorAlert(title, error) {
  return Swal.fire({
    icon: 'error',
    title,
    text: typeof error === 'string' ? error : getApiErrorMessage(error),
    confirmButtonColor: '#ef4444',
  })
}

export function showConfirmAlert(title, text) {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
  })
}
