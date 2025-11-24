const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../utils/jwt')
const { listLocales, fetchLocaleMessages, updatePreferredLocale } = require('../controllers/localeController')

router.get('/', listLocales)
router.get('/:locale', fetchLocaleMessages)
router.post('/preferred', authMiddleware, updatePreferredLocale)

module.exports = router
