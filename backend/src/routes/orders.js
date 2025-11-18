const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/jwt');
const {
	getCart,
	addToCart,
	removeFromCart,
	checkout,
	listOrders,
	getOrderById,
	updateOrder,
	linkCustomOrder,
} = require('../controllers/orderController');

router.use(authMiddleware);
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.post('/cart/remove', removeFromCart);
router.post('/checkout', checkout);
router.get('/', listOrders);
router.post('/link-custom', linkCustomOrder);
router.get('/:id', getOrderById);
router.patch('/:id', updateOrder);

module.exports = router;
