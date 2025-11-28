const express = require('express')
const router = express.Router()
const {
	listVipExperiences,
	getMyVipExperiences,
	createVipRequest,
	listMyVipRequests,
} = require('../controllers/vipController')
const { authMiddleware } = require('../utils/jwt')

router.get('/experiences', listVipExperiences)
router.get('/experiences/me', authMiddleware, getMyVipExperiences)
router.post('/requests', authMiddleware, createVipRequest)
router.get('/requests/me', authMiddleware, listMyVipRequests)

module.exports = router
