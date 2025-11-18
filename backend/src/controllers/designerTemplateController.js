const { DesignerTemplate } = require('../models');

async function listTemplates(req, res){
  const where = {};
  if(req.query.designerId) where.designerId = req.query.designerId;
  const templates = await DesignerTemplate.findAll({ where, order: [['createdAt','DESC']] });
  res.json({ templates });
}

async function createTemplate(req, res){
  if(req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' });
  const template = await DesignerTemplate.create({ ...req.body, designerId: req.user.id });
  res.json({ template });
}

async function updateTemplate(req, res){
  if(req.user.role !== 'designer') return res.status(403).json({ error: 'Forbidden' });
  const template = await DesignerTemplate.findByPk(req.params.id);
  if(!template) return res.status(404).json({ error: 'Not found' });
  if(template.designerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const fields = ['title','description','coverImage','tags','basePriceCents'];
  fields.forEach(key => {
    if(req.body[key] !== undefined) template[key] = req.body[key];
  });
  await template.save();
  res.json({ template });
}

module.exports = { listTemplates, createTemplate, updateTemplate };
