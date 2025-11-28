const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000'

function buildApiError(path, err) {
  const reason = err?.message || 'Unknown error'
  const hint = API_BASE.includes('localhost')
    ? 'Is the backend running on port 5000?'
    : 'Check NEXT_PUBLIC_API_URL.'
  const message = `Unable to reach ${API_BASE}${path}. ${hint} (${reason})`
  const error = new Error(message)
  error.cause = err
  return error
}

async function safeFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const requestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    next: options.next ?? { revalidate: 60 },
  }

  try {
    const res = await fetch(url, requestInit)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error(buildApiError(path, err).message)
    throw buildApiError(path, err)
  }
}

export async function getProducts(params = '') {
  return safeFetch(`/api/products${params}`)
}

export async function getProduct(id) {
  return safeFetch(`/api/products/${id}`)
}

export async function getDesigners() {
  return safeFetch('/api/designers')
}

export async function getCustomOrders(token) {
  return safeFetch('/api/custom-orders', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 0 },
    cache: 'no-store',
  })
}

export async function getDashboardSummary(token) {
  return safeFetch('/api/dashboard/summary', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 0 },
  })
}

export async function getCart(token) {
  return safeFetch('/api/orders/cart', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
    next: { revalidate: 0 },
  })
}

export async function getCurrencies() {
  return safeFetch('/api/currencies', {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
}

export { API_BASE }
