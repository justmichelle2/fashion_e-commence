const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { localUpload, presign } = require('../controllers/uploadController');
const { authMiddleware } = require('../utils/jwt');

// Local file upload (dev)
router.post('/local', authMiddleware, upload.single('file'), localUpload);
// Presign endpoint (S3) - stub
router.get('/presign', authMiddleware, presign);

module.exports = router;
