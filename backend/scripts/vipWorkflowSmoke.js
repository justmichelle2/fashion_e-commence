#!/usr/bin/env node
require('dotenv').config()
const http = require('http')
const app = require('../src/app')
const { sequelize } = require('../src/models')

async function main() {
  await sequelize.authenticate()
  await sequelize.sync({ alter: false })
  const server = await startServer()
  const port = server.address().port
  const base = `http://127.0.0.1:${port}/api`

  try {
    const customerLogin = await sendJson(base, 'POST', '/auth/login', {
      email: 'customer@example.com',
      password: 'customerpass',
    })
    const customerToken = customerLogin.token

    const vipExperiences = await sendJson(base, 'GET', '/vip/experiences')
    console.log('Available VIP experiences:', vipExperiences.experiences.map((exp) => exp.id))

    const vipRequest = await sendJson(
      base,
      'POST',
      '/vip/requests',
      {
        experienceId: 'atelier-video',
        productId: 1,
        notes: 'Smoke test VIP request',
      },
      customerToken,
    )
    console.log('Customer request status:', vipRequest.request.status, 'request id:', vipRequest.request.id)

    const pendingRequests = await sendJson(base, 'GET', '/vip/requests/me', null, customerToken)
    console.log('Customer pending requests:', pendingRequests.requests.length)

    const adminLogin = await sendJson(base, 'POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'adminpass',
    })
    const adminToken = adminLogin.token

    const adminList = await sendJson(base, 'GET', '/admin/vip/requests', null, adminToken)
    const targetRequest = adminList.requests.find((entry) => entry.id === vipRequest.request.id)
    if (!targetRequest) {
      throw new Error('Admin cannot locate the submitted VIP request')
    }

    await sendJson(
      base,
      'POST',
      `/admin/vip/requests/${targetRequest.id}/status`,
      { status: 'approved', adminComment: 'Approved via smoke script' },
      adminToken,
    )
    console.log('Admin approved VIP request', targetRequest.id)

    const refreshedRequests = await sendJson(base, 'GET', '/vip/requests/me', null, customerToken)
    const refreshed = refreshedRequests.requests.find((entry) => entry.id === targetRequest.id)
    console.log('Customer request after approval:', refreshed.status)

    const refreshedProfile = await sendJson(base, 'GET', '/auth/me', null, customerToken)
    console.log('Customer VIP experiences:', refreshedProfile.user.notificationPrefs?.vipExperiences || [])

    console.log('VIP workflow verification complete')
  } finally {
    await shutdown(server)
    await sequelize.close()
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
    server.on('error', reject)
  })
}

async function sendJson(base, method, path, body, token) {
  const payload = body ? JSON.stringify(body) : undefined
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetchJson(`${base}${path}`, { method, headers, body: payload })
  return res
}

function fetchJson(url, options) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const req = http.request(
      {
        method: options.method || 'GET',
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + (parsed.search || ''),
        headers: options.headers || {},
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => {
          raw += chunk
        })
        res.on('end', () => {
          let data = raw
          if (res.headers['content-type']?.includes('application/json')) {
            try {
              data = raw ? JSON.parse(raw) : null
            } catch (err) {
              return reject(new Error(`Failed to parse JSON: ${err.message}`))
            }
          }
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${raw}`))
          }
          resolve(data)
        })
      },
    )
    req.on('error', reject)
    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

function shutdown(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

main().catch((err) => {
  console.error('VIP workflow check failed:', err)
  process.exit(1)
})
