const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../utils/jwt')
const { upload } = require('../utils/upload')
const {
  listPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require('../controllers/designerPortfolioController')

router.get('/', authMiddleware, listPortfolios)
router.post('/', authMiddleware, upload.array('images', 10), createPortfolio)
router.put('/:id', authMiddleware, upload.array('images', 10), updatePortfolio)
router.delete('/:id', authMiddleware, deletePortfolio)

module.exports = router
