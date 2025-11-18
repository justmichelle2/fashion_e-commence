import client from './client';

export async function fetchOrders() {
  const { data } = await client.get('/orders');
  return data.orders || [];
}

export async function fetchOrder(orderId) {
  const { data } = await client.get(`/orders/${orderId}`);
  return data.order;
}

export async function fetchCart() {
  const { data } = await client.get('/orders/cart');
  return data.order;
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await client.post('/orders/cart/add', { productId, quantity });
  return data.order;
}

export async function removeFromCart(productId) {
  const { data } = await client.post('/orders/cart/remove', { productId });
  return data.order;
}

export async function checkout(payload) {
  const { data } = await client.post('/orders/checkout', payload);
  return data;
}
