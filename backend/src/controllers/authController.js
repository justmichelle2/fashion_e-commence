const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError, ValidationError } = require('sequelize');
const config = require('../config/config');
const { normalizeCurrency } = require('../utils/currency');

const PROFILE_ATTRIBUTES = [
  'id',
  'email',
  'name',
  'role',
  'bio',
  'verified',
  'portfolioUrl',
  'location',
  'phoneNumber',
  'styleNotes',
  'pronouns',
  'preferredLocale',
  'preferredCurrency',
  'notificationPrefs',
];
const MUTABLE_PROFILE_FIELDS = ['name', 'phoneNumber', 'location', 'styleNotes', 'pronouns', 'preferredLocale', 'preferredCurrency'];

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already used' });

    // Prevent clients from assigning themselves admin role.
    const safeRole = role === 'designer' ? 'designer' : 'customer';

    const user = await User.create({ name, email, role: safeRole });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLocale: user.preferredLocale,
        preferredCurrency: user.preferredCurrency,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError || err?.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already used' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Invalid input' });
    }
    console.error('Register failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLocale: user.preferredLocale,
        preferredCurrency: user.preferredCurrency,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (err) {
    console.error('Login failed', err);
    res.status(500).json({ error: 'Internal server error', details: err.message, stack: err.stack });
  }
}

async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: PROFILE_ATTRIBUTES });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Profile lookup failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateMe(req, res) {
  try {
    const payload = {};
    for (const field of MUTABLE_PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        const rawValue = req.body[field];
        if (typeof rawValue === 'string') {
          payload[field] = rawValue.trim();
        } else if (rawValue === null) {
          payload[field] = null;
        } else if (rawValue !== undefined) {
          payload[field] = rawValue;
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (Object.prototype.hasOwnProperty.call(payload, 'preferredCurrency')) {
      const normalized = normalizeCurrency(payload.preferredCurrency);
      if (!normalized) {
        return res.status(400).json({ error: 'Unsupported currency' });
      }
      payload.preferredCurrency = normalized;
    }

    Object.assign(user, payload);
    await user.save();
    await user.reload({ attributes: PROFILE_ATTRIBUTES });

    res.json({ user });
  } catch (err) {
    console.error('Profile update failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function uploadId(req, res) {
  try {
    // multer stores file and sets req.file
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const url = `/uploads/${req.file.filename}`;
    user.idDocuments = (user.idDocuments || []).concat([url]);
    user.kycStatus = 'pending';
    await user.save();
    res.json({ message: 'ID uploaded, KYC pending', url });
  } catch (err) {
    console.error('ID upload failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login, me, updateMe, uploadId };
