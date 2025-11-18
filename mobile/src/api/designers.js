import client from './client';

export async function fetchDesigners() {
  const { data } = await client.get('/designers');
  return data.designers || [];
}

export async function fetchDesigner(designerId) {
  const { data } = await client.get(`/designers/${designerId}`);
  return data;
}
