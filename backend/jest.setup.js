process.env.NODE_ENV = 'test'
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite::memory:'
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret'
}

const { sequelize } = require('./src/models')

beforeEach(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})
