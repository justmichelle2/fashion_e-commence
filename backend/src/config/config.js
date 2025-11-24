require('dotenv').config();
const url = require('url');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fashiondb';
let dbHost = 'localhost';
let dbIsLocal = true;
try {
  const parsed = new url.URL(databaseUrl);
  dbHost = parsed.hostname || dbHost;
  dbIsLocal = ['localhost', '127.0.0.1'].includes(dbHost);
} catch (e) {
  // leave defaults
}

module.exports = {
  databaseUrl,
  dbHost,
  dbIsLocal,
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  stripeKey: process.env.STRIPE_SECRET_KEY || '',
  dialect: databaseUrl.startsWith('sqlite') ? 'sqlite' : 'postgres',
  storage: databaseUrl.startsWith('sqlite') ? databaseUrl.replace('sqlite:', '') : undefined,
};
