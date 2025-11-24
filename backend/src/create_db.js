require('dotenv').config();
const { Client } = require('pg');

async function ensureDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Please set DATABASE_URL in .env before running this script.');
    process.exit(1);
  }

  if (databaseUrl.startsWith('sqlite')) {
    console.log('Using SQLite, skipping database creation.');
    process.exit(0);
  }

  try {
    const parsed = new URL(databaseUrl);
    const targetDb = (parsed.pathname || '').replace(/^\//, '') || 'fashiondb';
    // connect to the default 'postgres' database to run CREATE DATABASE
    parsed.pathname = '/postgres';
    const adminConn = parsed.toString();

    const client = new Client({ connectionString: adminConn });
    await client.connect();

    const check = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [targetDb]);
    if (check.rowCount === 0) {
      console.log(`Database \"${targetDb}\" not found — creating...`);
      // Create database (note: identifier quoted to allow mixed-case names)
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database \"${targetDb}\" already exists.`);
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create/check database:', err.message || err);
    process.exit(1);
  }
}

ensureDatabase();
