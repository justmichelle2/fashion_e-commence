const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.get('/profile', authenticate, customerController.getCustomerProfile);
router.put('/measurements', authenticate, customerController.updateMeasurements);
router.get('/orders', authenticate, customerController.getOrderHistory);
router.get('/orders/:id', authenticate, customerController.getOrderDetails);
router.get('/favorites', authenticate, customerController.getFavorites);
router.get('/recommendations', authenticate, customerController.getRecommendations);

module.exports = router;
