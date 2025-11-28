const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../utils/jwt');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);

// Protected routes
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/comments', authenticate, postController.commentOnPost);
router.delete('/comments/:commentId', authenticate, postController.deleteComment);

module.exports = router;
