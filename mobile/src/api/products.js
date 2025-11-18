import client from './client';

export async function fetchProducts(params = {}) {
  const { data } = await client.get('/products', { params });
  return data.products || [];
}

export async function fetchTrendingProducts() {
  const { data } = await client.get('/products/trending');
  return data.products || [];
}

export async function fetchProduct(productId) {
  const { data } = await client.get(`/products/${productId}`);
  return data.product;
}
