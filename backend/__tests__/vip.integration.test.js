const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const { User } = require('../src/models')
const config = require('../src/config/config')
const { VIP_EXPERIENCES } = require('../src/utils/vip')

function authHeader(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '1h' })
  return `Bearer ${token}`
}

describe('VIP experience catalog', () => {
  test('is available publicly', async () => {
    const res = await request(app).get('/api/vip/experiences')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.experiences)).toBe(true)
    expect(res.body.experiences.length).toBe(VIP_EXPERIENCES.length)
  })
})

describe('Admin VIP assignment flow', () => {
  test('admin can grant and user can fetch VIP experiences', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.vip@example.com',
      role: 'admin',
    })
    const customer = await User.create({
      name: 'VIP Prospect',
      email: 'vip.prospect@example.com',
      role: 'customer',
    })

    const experience = VIP_EXPERIENCES[0]

    const grantRes = await request(app)
      .post('/api/admin/vip/experiences')
      .set('Authorization', authHeader(admin))
      .send({ userId: customer.id, experienceId: experience.id })

    expect(grantRes.status).toBe(200)
    expect(grantRes.body.vipExperiences).toContain(experience.id)

    const myVipRes = await request(app)
      .get('/api/vip/experiences/me')
      .set('Authorization', authHeader(customer))

    expect(myVipRes.status).toBe(200)
    expect(myVipRes.body.grantedIds).toContain(experience.id)
    expect(myVipRes.body.experiences[0].id).toBe(experience.id)
  })
})
