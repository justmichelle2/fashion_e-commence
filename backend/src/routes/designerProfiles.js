const express = require('express');
const router = express.Router();
const designerProfileController = require('../controllers/designerProfileController');
const { authenticate } = require('../utils/jwt');

// Public routes
router.get('/:userId', designerProfileController.getProfile);

// Protected routes (designer only)
router.put('/:id', authenticate, designerProfileController.updateProfile);
router.get('/:id/analytics', authenticate, designerProfileController.getAnalytics);
router.get('/:id/revenue', authenticate, designerProfileController.getRevenue);

module.exports = router;
