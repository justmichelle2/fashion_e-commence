const { User } = require('../models');

async function adminOnly(req, res, next){
  if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  // optionally, we could reload user from DB to ensure up-to-date role
  next();
}

module.exports = { adminOnly };
