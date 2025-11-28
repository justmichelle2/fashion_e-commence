const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'role', 'email', 'name', 'verified', 'kycStatus', 'preferredCurrency', 'preferredLocale', 'avatarUrl'],
    });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      verified: user.verified,
      kycStatus: user.kycStatus,
      preferredCurrency: user.preferredCurrency,
      preferredLocale: user.preferredLocale,
      avatarUrl: user.avatarUrl,
    };
    next();
  } catch (err) {
    console.warn('authMiddleware error', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth - doesn't fail if no token, but sets req.user if valid token provided
async function optionalAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    req.user = null;
    return next();
  }

  const parts = auth.split(' ');
  if (parts.length !== 2) {
    req.user = null;
    return next();
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'role', 'email', 'name', 'verified', 'kycStatus', 'preferredCurrency', 'preferredLocale', 'avatarUrl'],
    });
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        verified: user.verified,
        kycStatus: user.kycStatus,
        preferredCurrency: user.preferredCurrency,
        preferredLocale: user.preferredLocale,
        avatarUrl: user.avatarUrl,
      };
    } else {
      req.user = null;
    }
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  authenticate: authMiddleware, // Alias for consistency
  optionalAuth: optionalAuthMiddleware // Alias for consistency
};
