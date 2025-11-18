const { DesignerPortfolio } = require('../models')
const { validate, schemas } = require('../utils/validators')

function isDesigner(user) {
  return user && user.role === 'designer'
}

function parseList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean)
      } catch (err) {
        // ignore invalid json, fall through to comma split
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function collectImages(req) {
  const base = parseList(req.body.images)
  const uploadPaths = (req.files || []).map((file) => `/uploads/${file.filename}`)
  return Array.from(new Set([...base, ...uploadPaths]))
}

async function listPortfolios(req, res) {
  const designerId = req.query.designerId || (isDesigner(req.user) ? req.user.id : undefined)
  const where = {}
  if (designerId) where.designerId = designerId
  if (!isDesigner(req.user)) where.visibility = 'public'

  const portfolios = await DesignerPortfolio.findAll({ where, order: [['createdAt', 'DESC']] })
  res.json({ portfolios })
}

async function createPortfolio(req, res) {
  if (!isDesigner(req.user)) return res.status(403).json({ error: 'Forbidden' })
  const parsed = validate(schemas.designerPortfolioCreate, req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const images = collectImages(req)
  const portfolio = await DesignerPortfolio.create({ ...parsed.data, designerId: req.user.id, images })
  res.json({ portfolio })
}

async function updatePortfolio(req, res) {
  if (!isDesigner(req.user)) return res.status(403).json({ error: 'Forbidden' })
  const portfolio = await DesignerPortfolio.findByPk(req.params.id)
  if (!portfolio) return res.status(404).json({ error: 'Not found' })
  if (portfolio.designerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  const parsed = validate(schemas.designerPortfolioUpdate, req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  Object.assign(portfolio, parsed.data)
  const images = collectImages(req)
  if (images.length) portfolio.images = images
  await portfolio.save()
  res.json({ portfolio })
}

async function deletePortfolio(req, res) {
  if (!isDesigner(req.user)) return res.status(403).json({ error: 'Forbidden' })
  const portfolio = await DesignerPortfolio.findByPk(req.params.id)
  if (!portfolio) return res.status(404).json({ error: 'Not found' })
  if (portfolio.designerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  await portfolio.destroy()
  res.json({ success: true })
}

module.exports = { listPortfolios, createPortfolio, updatePortfolio, deletePortfolio }
