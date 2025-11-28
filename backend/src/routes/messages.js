const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../utils/jwt');
const multer = require('multer');
const path = require('path');

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/messages/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// All routes require authentication
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversations/:conversationId', authenticate, messageController.getMessages);
router.post('/', authenticate, messageController.sendMessage);
router.put('/conversations/:conversationId/read', authenticate, messageController.markAsRead);
router.post('/upload', authenticate, upload.single('file'), messageController.uploadMedia);

module.exports = router;
