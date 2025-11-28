const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../utils/jwt')
const { listCurrencies, updatePreferredCurrency } = require('../controllers/currencyController')

router.get('/', listCurrencies)
router.post('/preferred', authMiddleware, updatePreferredCurrency)

module.exports = router
