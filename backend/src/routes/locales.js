const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../utils/jwt')
const { listLocales, getLocaleMessages, updatePreferredLocale } = require('../controllers/localeController')

router.get('/', listLocales)
router.get('/:locale', getLocaleMessages)
router.post('/preferred', authMiddleware, updatePreferredLocale)

module.exports = router
