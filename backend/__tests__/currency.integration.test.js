const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const { User } = require('../src/models')
const config = require('../src/config/config')
const { SUPPORTED_CURRENCY_CODES } = require('../src/utils/currency')

function authHeaderFor(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '1h' })
  return `Bearer ${token}`
}

describe('Currency metadata API', () => {
  test('returns supported currencies and rates', async () => {
    const res = await request(app).get('/api/currencies')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.currencies)).toBe(true)
    expect(res.body.currencies.length).toBeGreaterThanOrEqual(4)
    expect(res.body.codes).toEqual(expect.arrayContaining(SUPPORTED_CURRENCY_CODES))
    expect(res.body.rates).toBeDefined()
    expect(res.body.rateSource).toBeDefined()
  })

  test('allows authenticated users to update preferred currency', async () => {
    const user = await User.create({
      name: 'Currency Lover',
      email: 'currency@example.com',
      role: 'customer',
      preferredCurrency: 'USD',
    })
    const res = await request(app)
      .post('/api/currencies/preferred')
      .set('Authorization', authHeaderFor(user))
      .send({ preferredCurrency: 'EUR' })

    expect(res.status).toBe(200)
    expect(res.body.preferredCurrency).toBe('EUR')

    await user.reload()
    expect(user.preferredCurrency).toBe('EUR')
  })
})

describe('Product currency enforcement', () => {
  test('rejects unsupported currency codes during create', async () => {
    const designer = await User.create({
      name: 'Designer',
      email: 'designer@example.com',
      role: 'designer',
    })

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', authHeaderFor(designer))
      .field('title', 'Avant Garde Gown')
      .field('priceCents', '250000')
      .field('currency', 'ZZZ')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Unsupported currency/i)
  })

  test('defaults new products to designer preference', async () => {
    const designer = await User.create({
      name: 'Preferred Designer',
      email: 'preferred@example.com',
      role: 'designer',
      preferredCurrency: 'GHS',
    })

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', authHeaderFor(designer))
      .field('title', 'Solar Satin Dress')
      .field('priceCents', '180000')

    expect(res.status).toBe(200)
    expect(res.body.product).toBeDefined()
    expect(res.body.product.currency).toBe('GHS')
  })
})

describe('Custom order flows', () => {
  test('persists customer preferred currency on new custom order', async () => {
    const customer = await User.create({
      name: 'VIP Customer',
      email: 'vip@example.com',
      role: 'customer',
      preferredCurrency: 'KES',
    })

    const res = await request(app)
      .post('/api/custom-orders')
      .set('Authorization', authHeaderFor(customer))
      .send({
        title: 'Bespoke Suit',
        description: 'Need a custom double-breasted suit',
      })

    expect(res.status).toBe(200)
    expect(res.body.order).toBeDefined()
    expect(res.body.order.currency).toBe('KES')
    expect(res.body.order.customerId).toBe(customer.id)
  })
})
