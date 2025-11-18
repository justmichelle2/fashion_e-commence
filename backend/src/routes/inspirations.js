const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../utils/jwt')
const { upload } = require('../utils/upload')
const {
  listInspirations,
  createInspiration,
  updateInspiration,
  deleteInspiration,
} = require('../controllers/inspirationController')

router.get('/', listInspirations)
router.post('/', authMiddleware, upload.array('media', 10), createInspiration)
router.put('/:id', authMiddleware, upload.array('media', 10), updateInspiration)
router.delete('/:id', authMiddleware, deleteInspiration)

module.exports = router
