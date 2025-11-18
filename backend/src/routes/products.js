const express = require('express');
const router = express.Router();
const { listProducts, createProduct, getProduct, trending, updateProduct } = require('../controllers/productController');
const { authMiddleware } = require('../utils/jwt');

router.get('/', listProducts);
router.get('/trending', trending);
router.get('/:id', getProduct);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);

module.exports = router;
