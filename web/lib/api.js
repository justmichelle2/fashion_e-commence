import { PRODUCTS, DESIGNERS } from '../data/mockProducts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';

async function safeFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const requestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    next: options.next ?? { revalidate: 60 },
  };

  try {
    const res = await fetch(url, requestInit);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API request failed, falling back to mocks:', url, err.message);
    throw err;
  }
}

export async function getProducts(params = '') {
  try {
    return await safeFetch(`/api/products${params}`);
  } catch (err) {
    return { products: PRODUCTS };
  }
}

export async function getProduct(id) {
  try {
    return await safeFetch(`/api/products/${id}`);
  } catch (err) {
    const fallback = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
    return { product: fallback };
  }
}

export async function getDesigners() {
  try {
    return await safeFetch('/api/designers');
  } catch (err) {
    return { designers: DESIGNERS };
  }
}

export async function getCustomOrders(token) {
  try {
    return await safeFetch('/api/custom-orders', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      next: { revalidate: 0 },
      cache: 'no-store',
    });
  } catch (err) {
    return { orders: [] };
  }
}

export async function getDashboardSummary(token) {
  try {
    return await safeFetch('/api/dashboard/summary', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      next: { revalidate: 0 },
    });
  } catch (err) {
    return { role: 'customer', cards: [] };
  }
}

export async function getCart(token) {
  try {
    return await safeFetch('/api/orders/cart', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
  } catch (err) {
    return { order: { items: [], subtotalCents: 0, totalCents: 0, currency: 'USD' } };
  }
}

export { API_BASE };
