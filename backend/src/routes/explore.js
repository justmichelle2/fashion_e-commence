const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');
const { authenticate, optionalAuth } = require('../utils/jwt');

// Public routes (with optional auth for personalization context)
router.get('/', optionalAuth, exploreController.getExploreFeed);
router.get('/search', exploreController.search);
router.get('/tags/trending', exploreController.getTrendingTags);

// Protected routes
router.get('/personalized', authenticate, exploreController.getPersonalizedFeed);

module.exports = router;
