import { PRODUCTS, DESIGNERS } from '../data/mockProducts'

async function fetchJson(url, opts){
  try{
    const res = await fetch(url, opts);
    if(!res.ok) throw new Error('Network error');
    return await res.json();
  }catch(err){
    // network/backend not available — will fall back to mock
    return null;
  }
}

export async function listProducts(){
  const r = await fetchJson('/api/products');
  if(r && r.products) return r.products;
  // fallback to mock
  return PRODUCTS.map(p => ({ ...p }));
}

export async function getProduct(id){
  const r = await fetchJson(`/api/products/${id}`);
  if(r && r.product) return r.product;
  return PRODUCTS.find(p => p.id === id) || null;
}

export async function listDesigners(){
  const r = await fetchJson('/api/designers');
  if(r && r.designers) return r.designers;
  return DESIGNERS.map(d => ({ ...d }));
}

export async function getDesigner(id){
  const r = await fetchJson(`/api/designers/${id}`);
  if(r && r.designer) return r.designer;
  return DESIGNERS.find(d => d.id === id) || null;
}

export default { listProducts, getProduct, listDesigners, getDesigner };
