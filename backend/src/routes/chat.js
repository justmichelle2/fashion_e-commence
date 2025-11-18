const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../utils/jwt');
const { listMessages, sendMessage } = require('../controllers/chatController');

router.use(authMiddleware);
router.get('/:customOrderId', listMessages);
router.post('/:customOrderId', sendMessage);

module.exports = router;
