const API_BASE_FALLBACK = 'http://localhost:5000'

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    API_BASE_FALLBACK
  )
}
