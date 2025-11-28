const { Product, User } = require('../models');
const { Op } = require('sequelize');
const { upload } = require('../utils/upload');
const { validate, schemas } = require('../utils/validators');
const { normalizeCurrency } = require('../utils/currency');

async function listProducts(req, res){
  const {
    q, category, tag,
    minPrice, maxPrice,
    sort = 'createdAt', // 'trending'|'price_asc'|'price_desc'|'createdAt'
    page = 1, limit = 20
  } = req.query;

  const where = {};
  if(category) where.category = category;
  if(tag) where.tags = { [Op.contains]: [tag] };
  if(q) where[Op.or] = [
    { title: { [Op.iLike]: `%${q}%` } },
    { description: { [Op.iLike]: `%${q}%` } }
  ];
  if(minPrice) where.priceCents = { ...(where.priceCents||{}), [Op.gte]: parseInt(minPrice) };
  if(maxPrice) where.priceCents = { ...(where.priceCents||{}), [Op.lte]: parseInt(maxPrice) };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const order = [];
  if(sort === 'trending') order.push(['viewCount','DESC']);
  else if(sort === 'price_asc') order.push(['priceCents','ASC']);
  else if(sort === 'price_desc') order.push(['priceCents','DESC']);
  else order.push(['createdAt','DESC']);

  const products = await Product.findAll({ where, limit: parseInt(limit), offset, order });
  res.json({ products });
}

async function getProduct(req, res){
  const p = await Product.findByPk(req.params.id);
  if(!p) return res.status(404).json({ error: 'Not found' });
  // increment view count (best-effort)
  try{ p.increment('viewCount'); }catch(e){}
  res.json({ product: p });
}

function normalizeStringArray(value){
  if(Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean)
  if(typeof value === 'string'){
    const trimmed = value.trim()
    if(!trimmed) return []
    if(trimmed.startsWith('[')){
      try{
        const parsed = JSON.parse(trimmed)
        if(Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean)
      }catch(err){ /* ignore */ }
    }
    return trimmed.split(',').map((segment) => segment.trim()).filter(Boolean)
  }
  return []
}

function extractArrayField(req, field){
  if(Object.prototype.hasOwnProperty.call(req.body || {}, field)){
    return normalizeStringArray(req.body[field])
  }
  const multiField = `${field}[]`
  if(Object.prototype.hasOwnProperty.call(req.body || {}, multiField)){
    return normalizeStringArray(req.body[multiField])
  }
  return undefined
}

function collectUploadedPaths(files = []){
  return files.map((file) => `/uploads/${file.filename}`)
}

function dedupe(arr = []){
  return Array.from(new Set(arr.filter(Boolean)))
}

async function createProduct(req, res){
  if(!req.user || req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' })

  const payload = { ...req.body }
  if(payload.priceCents !== undefined) payload.priceCents = Number(payload.priceCents)

  if(payload.currency !== undefined){
    const normalizedCurrency = normalizeCurrency(payload.currency)
    if(!normalizedCurrency) return res.status(400).json({ error: 'Unsupported currency' })
    payload.currency = normalizedCurrency
  }else if(req.user?.preferredCurrency){
    const normalizedPreferred = normalizeCurrency(req.user.preferredCurrency)
    if(normalizedPreferred) payload.currency = normalizedPreferred
  }

  const tags = extractArrayField(req, 'tags')
  if(tags !== undefined) payload.tags = tags

  const parsed = validate(schemas.productCreate, payload)
  if(parsed.error) return res.status(400).json({ error: parsed.error })

  const bodyImages = extractArrayField(req, 'images') || []
  const uploadedImages = collectUploadedPaths(req.files)
  const images = dedupe([...bodyImages, ...uploadedImages])

  const product = await Product.create({
    ...parsed.data,
    designerId: req.user.id,
    images,
  })
  res.json({ product })
}

async function updateProduct(req, res){
  if(!req.user || req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' })
  const product = await Product.findByPk(req.params.id)
  if(!product) return res.status(404).json({ error: 'Not found' })
  if(product.designerId !== req.user.id) return res.status(403).json({ error: 'Not yours' })

  const payload = { ...req.body }
  if(payload.priceCents !== undefined) payload.priceCents = Number(payload.priceCents)
  if(payload.currency !== undefined){
    const normalizedCurrency = normalizeCurrency(payload.currency)
    if(!normalizedCurrency) return res.status(400).json({ error: 'Unsupported currency' })
    payload.currency = normalizedCurrency
  }
  const tags = extractArrayField(req, 'tags')
  if(tags !== undefined) payload.tags = tags

  const parsed = validate(schemas.productUpdate, payload)
  if(parsed.error) return res.status(400).json({ error: parsed.error })

  Object.assign(product, parsed.data)

  const removeImages = extractArrayField(req, 'removeImages') || []
  const bodyImages = extractArrayField(req, 'images') || []
  const uploadImages = collectUploadedPaths(req.files)

  if(removeImages.length || bodyImages.length || uploadImages.length){
    let nextImages = Array.isArray(product.images) ? product.images.filter((img) => !removeImages.includes(img)) : []
    nextImages = dedupe([...nextImages, ...bodyImages, ...uploadImages])
    product.images = nextImages
  }

  await product.save()
  res.json({ product })
}

// simple endpoint to get trending products
async function trending(req, res){
  const products = await Product.findAll({ limit: 10, order: [['viewCount','DESC']] });
  res.json({ products });
}

module.exports = { listProducts, createProduct, getProduct, updateProduct, trending };
