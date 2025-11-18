const { User, Product } = require('../models');

async function listDesigners(req, res){
  const designers = await User.findAll({ where: { role: 'designer' }, attributes: ['id','name','bio','portfolioUrl','verified'] });
  res.json({ designers });
}

async function getDesigner(req, res){
  const d = await User.findByPk(req.params.id, { attributes: ['id','name','bio','portfolioUrl','verified'] });
  if(!d) return res.status(404).json({ error: 'Not found' });
  const products = await Product.findAll({ where: { designerId: d.id }, limit: 20 });
  res.json({ designer: d, products });
}

module.exports = { listDesigners, getDesigner };
