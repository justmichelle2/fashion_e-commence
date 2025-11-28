const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

async function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: ['id','role','email','name','verified','kycStatus','preferredCurrency','preferredLocale'],
    });
    if(!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      verified: user.verified,
      kycStatus: user.kycStatus,
      preferredCurrency: user.preferredCurrency,
      preferredLocale: user.preferredLocale,
    };
    next();
  }catch(err){
    console.warn('authMiddleware error', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware };
