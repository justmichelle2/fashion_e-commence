const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.post('/', authenticate, followController.followDesigner);
router.delete('/:followingId', authenticate, followController.unfollowDesigner);
router.get('/followers/:designerId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);
router.get('/status/:designerId', authenticate, followController.checkFollowStatus);

module.exports = router;
