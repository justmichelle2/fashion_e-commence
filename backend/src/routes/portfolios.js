const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate, optionalAuth } = require('../utils/jwt');

// Public routes (with optional auth for visibility checks)
router.get('/', optionalAuth, portfolioController.getPortfolioItems);
router.get('/:id', optionalAuth, portfolioController.getPortfolioItem);

// Protected routes
router.post('/', authenticate, portfolioController.createPortfolioItem);
router.put('/:id', authenticate, portfolioController.updatePortfolioItem);
router.delete('/:id', authenticate, portfolioController.deletePortfolioItem);
router.put('/:id/feature', authenticate, portfolioController.toggleFeatured);

module.exports = router;
