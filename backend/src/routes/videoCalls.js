const express = require('express');
const router = express.Router();
const videoCallController = require('../controllers/videoCallController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.post('/', authenticate, videoCallController.initiateCall);
router.post('/:id/join', authenticate, videoCallController.joinCall);
router.post('/:id/end', authenticate, videoCallController.endCall);
router.post('/:id/reject', authenticate, videoCallController.rejectCall);
router.get('/history', authenticate, videoCallController.getCallHistory);

module.exports = router;
