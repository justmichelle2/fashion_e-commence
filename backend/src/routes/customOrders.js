const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/jwt');
const { createRequest, listRequestsForUser, respondToRequest, updateStatus, attachAssets } = require('../controllers/customOrderController');

router.post('/', authMiddleware, createRequest);
router.get('/', authMiddleware, listRequestsForUser);
router.post('/:id/respond', authMiddleware, respondToRequest);
router.post('/:id/status', authMiddleware, updateStatus);
router.post('/:id/assets', authMiddleware, attachAssets);

module.exports = router;
