#!/usr/bin/env node
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

async function main(){
  const server = await startServer();
  const email = `smoke+${Date.now()}@example.com`;
  const payload = { name: 'Smoke Test', email, password: 'Secret123!', role: 'customer' };

  try{
    const { statusCode, body } = await sendRequest(server.address().port, payload);
    console.log('Register status:', statusCode);
    console.log('Response body:', body);

    if(statusCode !== 200){
      throw new Error(`Unexpected status code ${statusCode}`);
    }
  }finally{
    await User.destroy({ where: { email } });
    await shutdown(server);
    await sequelize.close();
  }
}

async function startServer(){
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });

  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function sendRequest(port, payload){
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: raw }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function shutdown(server){
  return new Promise((resolve) => server.close(resolve));
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
