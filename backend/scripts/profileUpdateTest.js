#!/usr/bin/env node
require('dotenv').config();
const { sequelize, User } = require('../src/models');

const API_BASE = process.argv[2] || process.env.API_BASE || 'http://localhost:5000/api';

async function requestJson(url, options = {}){
  const defaultHeaders = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers: defaultHeaders });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = { raw: text };
    }
  }
  if (!response.ok) {
    const message = data?.error || data?.message || text;
    throw new Error(`Request failed ${response.status}: ${message}`);
  }
  return data;
}

async function main(){
  const email = `profile+${Date.now()}@example.com`;
  const password = 'Secret123!';

  const register = await requestJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Profile Flow', email, password, role: 'customer' }),
  });

  const token = register.token;
  if (!token) throw new Error('Missing token from register response');

  const updatePayload = {
    name: 'Updated Profile',
    phoneNumber: '+233200000000',
    location: 'Accra, Ghana',
    styleNotes: 'Bold silhouettes only',
    pronouns: 'She/They',
  };

  const profile = await requestJson(`${API_BASE}/auth/me`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(updatePayload),
  });

  const me = await requestJson(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('Profile PATCH user:', profile.user);
  console.log('Profile GET user:', me.user);

  await User.destroy({ where: { email } });
}

main()
  .catch((err) => {
    console.error('Profile test failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch (err) {
      console.warn('Failed to close sequelize', err.message);
    }
  });
