const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function toApiError(path, err){
  const reason = err?.message || 'Unknown error'
  const hint = API_BASE.includes('localhost')
    ? 'Is the backend running on port 5000?'
    : 'Check NEXT_PUBLIC_API_URL.'
  const error = new Error(`Unable to reach ${API_BASE}${path}. ${hint} (${reason})`)
  error.cause = err
  return error
}

async function fetchJson(path, opts){
  const url = `${API_BASE}${path}`
  try{
    const res = await fetch(url, opts)
    if(!res.ok) throw new Error('Network error')
    return await res.json()
  }catch(err){
    throw toApiError(path, err)
  }
}

export async function listProducts(){
  const r = await fetchJson('/api/products')
  return r?.products ?? []
}

export async function getProduct(id){
  const r = await fetchJson(`/api/products/${id}`)
  return r?.product ?? null
}

export async function listDesigners(){
  const r = await fetchJson('/api/designers')
  return r?.designers ?? []
}

export async function getDesigner(id){
  const r = await fetchJson(`/api/designers/${id}`)
  return r?.designer ?? null
}

export default { listProducts, getProduct, listDesigners, getDesigner }
