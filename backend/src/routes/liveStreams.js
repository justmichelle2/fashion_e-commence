const express = require('express');
const router = express.Router();
const liveStreamController = require('../controllers/liveStreamController');
const { authenticate, optionalAuth } = require('../utils/jwt');

// Public routes
router.get('/active', liveStreamController.getActiveStreams);
router.get('/history/:designerId', liveStreamController.getStreamHistory);

// Protected routes
router.post('/', authenticate, liveStreamController.createStream);
router.post('/:id/end', authenticate, liveStreamController.endStream);
router.post('/:id/join', optionalAuth, liveStreamController.joinStream);
router.post('/:id/leave', optionalAuth, liveStreamController.leaveStream);

module.exports = router;
