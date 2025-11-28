const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../utils/jwt');

// All routes require authentication
router.post('/', authenticate, wishlistController.addToWishlist);
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);
router.get('/', authenticate, wishlistController.getWishlist);
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

module.exports = router;
