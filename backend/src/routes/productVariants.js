const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariantController');
const { authenticate } = require('../utils/jwt');

// Public routes
router.get('/product/:productId', productVariantController.getVariants);
router.get('/:id', productVariantController.getVariant);

// Protected routes
router.post('/', authenticate, productVariantController.createVariant);
router.put('/:id', authenticate, productVariantController.updateVariant);
router.delete('/:id', authenticate, productVariantController.deleteVariant);
router.put('/:id/inventory', authenticate, productVariantController.updateInventory);

module.exports = router;
