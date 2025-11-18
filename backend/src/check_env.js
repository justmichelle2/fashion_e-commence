require('dotenv').config();
const config = require('./config/config');
const { Client } = require('pg');

async function check(){
  console.log('Checking backend environment...');
  console.log('NODE_ENV=', process.env.NODE_ENV || 'development');
  console.log('DATABASE_URL=', config.databaseUrl);
  console.log('DB host detected=', config.dbHost, ' (local?)', config.dbIsLocal);

  // Try connecting using pg client
  try{
    const client = new Client({ connectionString: config.databaseUrl });
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('Postgres connected:', res.rows[0].version.split(',')[0]);
    await client.end();
  }catch(err){
    console.error('Failed to connect to Postgres using connection string.');
    console.error(err.message || err);
    console.error('\nNote: If you previously used the `psql` CLI, that is not required — this script uses the pg Node library.');
    process.exit(1);
  }

  console.log('Environment check passed.');
  process.exit(0);
}

check();
