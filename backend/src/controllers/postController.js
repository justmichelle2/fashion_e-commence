const { Post, User, Like, Comment } = require('../models');
const { Op } = require('sequelize');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, mediaUrls, mediaType, tags, visibility } = req.body;
        const designerId = req.user.id;

        // Verify user is a designer
        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can create posts' });
        }

        const post = await Post.create({
            designerId,
            content,
            mediaUrls: mediaUrls || [],
            mediaType: mediaType || 'image',
            tags: tags || [],
            visibility: visibility || 'public'
        });

        const postWithDesigner = await Post.findByPk(post.id, {
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl', 'role']
            }]
        });

        res.status(201).json({ message: 'Post created', post: postWithDesigner });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

// Get posts (feed, explore, profile)
exports.getPosts = async (req, res) => {
    try {
        const { designerId, type = 'explore', limit = 20, offset = 0 } = req.query;
        const userId = req.user?.id;

        let whereClause = { visibility: 'public' };

        if (designerId) {
            whereClause.designerId = designerId;
        }

        // TODO: Implement feed logic based on follows
        // if (type === 'feed' && userId) {
        //   const follows = await Follow.findAll({ where: { followerId: userId } });
        //   const followingIds = follows.map(f => f.followingId);
        //   whereClause.designerId = { [Op.in]: followingIds };
        // }

        const posts = await Post.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl', 'role']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Check if user has liked each post
        const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
            const postData = post.toJSON();
            if (userId) {
                const like = await Like.findOne({
                    where: { userId, postId: post.id }
                });
                postData.isLikedByMe = !!like;
            } else {
                postData.isLikedByMe = false;
            }
            return postData;
        }));

        const total = await Post.count({ where: whereClause });

        res.json({ posts: postsWithLikeStatus, total, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// Get single post
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl', 'role']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'avatarUrl']
                    }],
                    where: { parentCommentId: null },
                    required: false
                }
            ]
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment view count
        await post.increment('viewCount');

        const postData = post.toJSON();
        if (req.user) {
            const like = await Like.findOne({
                where: { userId: req.user.id, postId: id }
            });
            postData.isLikedByMe = !!like;
        }

        res.json({ post: postData });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, mediaUrls, tags, visibility, isPinned } = req.body;

        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        await post.update({
            content: content !== undefined ? content : post.content,
            mediaUrls: mediaUrls !== undefined ? mediaUrls : post.mediaUrls,
            tags: tags !== undefined ? tags : post.tags,
            visibility: visibility !== undefined ? visibility : post.visibility,
            isPinned: isPinned !== undefined ? isPinned : post.isPinned
        });

        res.json({ message: 'Post updated', post });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.designerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await post.destroy();

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

// Like/unlike post
exports.likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await Like.findOne({
            where: { userId, postId: id }
        });

        if (existingLike) {
            // Unlike
            await existingLike.destroy();
            await post.decrement('likeCount');
            return res.json({ message: 'Post unliked', likeCount: post.likeCount - 1 });
        } else {
            // Like
            await Like.create({ userId, postId: id });
            await post.increment('likeCount');

            // TODO: Create notification for post owner

            return res.json({ message: 'Post liked', likeCount: post.likeCount + 1 });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

// Add comment
exports.commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await Comment.create({
            userId,
            postId: id,
            content: content.trim(),
            parentCommentId: parentCommentId || null
        });

        await post.increment('commentCount');

        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'avatarUrl']
            }]
        });

        // TODO: Create notification for post owner

        res.status(201).json({ message: 'Comment added', comment: commentWithUser });
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        const post = await Post.findByPk(comment.postId);
        await comment.destroy();

        if (post) {
            await post.decrement('commentCount');
        }

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
