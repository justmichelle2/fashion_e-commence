import client from './client';

export async function createCustomOrder(payload) {
  const { data } = await client.post('/custom-orders', payload);
  return data.order;
}

export async function fetchCustomOrders() {
  const { data } = await client.get('/custom-orders');
  return data.orders || [];
}

export async function attachAssets(orderId, inspirationImages) {
  const { data } = await client.post(`/custom-orders/${orderId}/assets`, { inspirationImages });
  return data.order;
}
