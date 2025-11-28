const { User, VipRequest } = require('../models')
const { VIP_EXPERIENCES, getVipExperience, applyVipExperience } = require('../utils/vip')

function listVipExperiences(req, res) {
  res.json({ experiences: VIP_EXPERIENCES })
}

async function getMyVipExperiences(req, res) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'notificationPrefs'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const grantedIds = Array.isArray(user.notificationPrefs?.vipExperiences)
      ? user.notificationPrefs.vipExperiences
      : []
    const experiences = VIP_EXPERIENCES.filter((exp) => grantedIds.includes(exp.id))
    res.json({ experiences, grantedIds })
  } catch (err) {
    console.error('getMyVipExperiences error', err)
    res.status(500).json({ error: 'Unable to load VIP experiences' })
  }
}

function serializeVipRequest(requestInstance) {
  if (!requestInstance) return null
  const request = requestInstance.toJSON()
  return {
    ...request,
    experience: getVipExperience(request.experienceId),
    requester: request.requester
      ? { id: request.requester.id, name: request.requester.name, email: request.requester.email }
      : null,
  }
}

async function createVipRequest(req, res) {
  const { experienceId, notes, productId, productTitle } = req.body || {}
  const experience = getVipExperience(experienceId)
  if (!experience) return res.status(400).json({ error: 'Unknown experience' })
  try {
    const existing = await VipRequest.findOne({ where: { userId: req.user.id, experienceId, status: 'pending' } })
    if (existing) {
      existing.notes = notes || existing.notes
      existing.productId = productId || existing.productId
      existing.productTitle = productTitle || existing.productTitle
      await existing.save()
      await existing.reload({ include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email'] }] })
      return res.json({ request: serializeVipRequest(existing) })
    }

    const request = await VipRequest.create({
      userId: req.user.id,
      experienceId,
      notes: notes || '',
      productId: productId || null,
      productTitle: productTitle || null,
    })
    await request.reload({ include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email'] }] })
    res.json({ request: serializeVipRequest(request) })
  } catch (err) {
    console.error('createVipRequest error', err)
    res.status(500).json({ error: 'Unable to submit VIP request' })
  }
}

async function listMyVipRequests(req, res) {
  try {
    const requests = await VipRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    })
    res.json({ requests: requests.map(serializeVipRequest) })
  } catch (err) {
    console.error('listMyVipRequests error', err)
    res.status(500).json({ error: 'Unable to load VIP requests' })
  }
}

async function listVipRequestsAdmin(req, res) {
  try {
    const requests = await VipRequest.findAll({
      include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 200,
    })
    res.json({ requests: requests.map(serializeVipRequest) })
  } catch (err) {
    console.error('listVipRequestsAdmin error', err)
    res.status(500).json({ error: 'Unable to load VIP requests' })
  }
}

async function updateVipRequestStatus(req, res) {
  const { id } = req.params
  const { status, adminComment } = req.body || {}
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  try {
    const request = await VipRequest.findByPk(id, {
      include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email', 'notificationPrefs'] }],
    })
    if (!request) return res.status(404).json({ error: 'Request not found' })

    request.status = status
    request.adminComment = adminComment || request.adminComment
    request.resolvedBy = req.user.id
    request.resolvedAt = new Date()
    await request.save()

    if (status === 'approved' && request.requester) {
      applyVipExperience(request.requester, request.experienceId, 'grant')
      await request.requester.save()
    }

    await request.reload({ include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email', 'notificationPrefs'] }] })
    res.json({ request: serializeVipRequest(request) })
  } catch (err) {
    console.error('updateVipRequestStatus error', err)
    res.status(500).json({ error: 'Unable to update VIP request' })
  }
}

async function assignVipExperience(req, res) {
  try {
    const { userId, experienceId, action = 'grant' } = req.body || {}
    if (!userId || !experienceId) return res.status(400).json({ error: 'userId and experienceId required' })
    const experience = getVipExperience(experienceId)
    if (!experience) return res.status(400).json({ error: 'Unknown experience' })
    const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email', 'notificationPrefs'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const vipExperiences = applyVipExperience(user, experienceId, action === 'revoke' ? 'revoke' : 'grant')
    await user.save()
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      vipExperiences,
      experience,
      action,
    })
  } catch (err) {
    console.error('assignVipExperience error', err)
    res.status(500).json({ error: 'Unable to update VIP experience' })
  }
}

module.exports = {
  listVipExperiences,
  getMyVipExperiences,
  createVipRequest,
  listMyVipRequests,
  listVipRequestsAdmin,
  updateVipRequestStatus,
  assignVipExperience,
  listVipCatalog: listVipExperiences,
}
