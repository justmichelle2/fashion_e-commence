const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.post('/', authenticate, withdrawalController.requestWithdrawal);
router.get('/', authenticate, withdrawalController.getWithdrawals);
router.put('/payment-method', authenticate, withdrawalController.updatePaymentMethod);
router.post('/:id/cancel', authenticate, withdrawalController.cancelWithdrawal);

// Admin only
router.post('/:id/process', authenticate, withdrawalController.processWithdrawal);

module.exports = router;
