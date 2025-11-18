const express = require('express');
const router = express.Router();
const { register, login, me, updateMe } = require('../controllers/authController');
const { authMiddleware } = require('../utils/jwt');
const { upload } = require('../utils/upload');
const { uploadId } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateMe);
router.put('/me', authMiddleware, updateMe);
router.post('/upload-id', authMiddleware, upload.single('file'), uploadId);

module.exports = router;
