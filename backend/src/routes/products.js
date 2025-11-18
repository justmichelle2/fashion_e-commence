const express = require('express');
const router = express.Router();
const { listProducts, createProduct, getProduct, trending, updateProduct } = require('../controllers/productController');
const { authMiddleware } = require('../utils/jwt');
const { upload } = require('../utils/upload');

router.get('/', listProducts);
router.get('/trending', trending);
router.get('/:id', getProduct);
router.post('/', authMiddleware, upload.array('images', 10), createProduct);
router.put('/:id', authMiddleware, upload.array('images', 10), updateProduct);

module.exports = router;
