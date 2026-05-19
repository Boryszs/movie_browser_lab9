import axios from 'axios'

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const apiMessage =
      typeof error.response?.data === 'object' && error.response.data !== null && 'status_message' in error.response.data
        ? String(error.response.data.status_message)
        : null

    if (status && apiMessage) {
      return `HTTP ${status}: ${apiMessage}`
    }

    if (status) {
      return `HTTP ${status}: ${error.message}`
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Wystąpił nieznany błąd.'
}
