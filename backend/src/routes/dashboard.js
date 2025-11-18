const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/jwt');
const { summary } = require('../controllers/dashboardController');

router.get('/summary', authMiddleware, summary);

module.exports = router;
