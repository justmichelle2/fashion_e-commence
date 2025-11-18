const { Inspiration } = require('../models')
const { validate, schemas } = require('../utils/validators')
const { Op } = require('sequelize')

function collectMedia(req) {
  const base = Array.isArray(req.body.media) ? req.body.media : []
  const uploadPaths = (req.files || []).map((file) => `/uploads/${file.filename}`)
  return Array.from(new Set([...base, ...uploadPaths]))
}

async function listInspirations(req, res) {
  const visibilityFilter = req.query.visibility
  const where = {}
  if (visibilityFilter) where.visibility = visibilityFilter
  if (!req.user) {
    where.visibility = 'public'
  } else {
    where[Op.or] = [{ visibility: 'public' }, { userId: req.user.id }]
  }
  const inspirations = await Inspiration.findAll({ where, order: [['createdAt', 'DESC']] })
  res.json({ inspirations })
}

async function createInspiration(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const parsed = validate(schemas.inspirationCreate, req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const media = collectMedia(req)
  const inspiration = await Inspiration.create({ ...parsed.data, media, userId: req.user.id })
  res.json({ inspiration })
}

async function updateInspiration(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const inspiration = await Inspiration.findByPk(req.params.id)
  if (!inspiration) return res.status(404).json({ error: 'Not found' })
  if (inspiration.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  const parsed = validate(schemas.inspirationCreate.partial(), req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  Object.assign(inspiration, parsed.data)
  const media = collectMedia(req)
  if (media.length) inspiration.media = media
  await inspiration.save()
  res.json({ inspiration })
}

async function deleteInspiration(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const inspiration = await Inspiration.findByPk(req.params.id)
  if (!inspiration) return res.status(404).json({ error: 'Not found' })
  if (inspiration.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  await inspiration.destroy()
  res.json({ success: true })
}

module.exports = { listInspirations, createInspiration, updateInspiration, deleteInspiration }
