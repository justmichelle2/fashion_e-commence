const { Product, User } = require('../models');
const { Op } = require('sequelize');

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

async function createProduct(req, res){
  const body = req.body;
  if(!req.user || req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' });
  const product = await Product.create({ ...body, designerId: req.user.id });
  res.json({ product });
}

async function updateProduct(req, res){
  if(!req.user || req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' });
  const product = await Product.findByPk(req.params.id);
  if(!product) return res.status(404).json({ error: 'Not found' });
  if(product.designerId !== req.user.id) return res.status(403).json({ error: 'Not yours' });
  const fields = ['title','description','priceCents','currency','images','tags','category','inventory','isFeatured','availability'];
  fields.forEach(key => {
    if(req.body[key] !== undefined) product[key] = req.body[key];
  });
  await product.save();
  res.json({ product });
}

// simple endpoint to get trending products
async function trending(req, res){
  const products = await Product.findAll({ limit: 10, order: [['viewCount','DESC']] });
  res.json({ products });
}

module.exports = { listProducts, createProduct, getProduct, updateProduct, trending };
