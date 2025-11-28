const { Post, Product, User, DesignerProfile, Follow, LiveStream } = require('../models');
const { Op } = require('sequelize');

// Get explore feed with trending content
exports.getExploreFeed = async (req, res) => {
    try {
        const { type = 'all', limit = 20, offset = 0 } = req.query;
        const userId = req.user?.id;

        let results = {};

        // Get trending posts
        if (type === 'all' || type === 'posts') {
            const posts = await Post.findAll({
                where: {
                    visibility: 'public',
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                },
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl'],
                    include: [{
                        model: DesignerProfile,
                        as: 'designerProfile',
                        attributes: ['isVerified']
                    }]
                }],
                order: [
                    [sequelize.literal('(likeCount * 2 + commentCount + viewCount / 10)'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.posts = posts;
        }

        // Get trending products
        if (type === 'all' || type === 'products') {
            const products = await Product.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                },
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }],
                order: [
                    [sequelize.literal('(viewCount + likeCount * 5)'), 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.products = products;
        }

        // Get featured designers
        if (type === 'all' || type === 'designers') {
            const designers = await User.findAll({
                where: { role: 'designer' },
                include: [{
                    model: DesignerProfile,
                    as: 'designerProfile',
                    where: {
                        [Op.or]: [
                            { isVerified: true },
                            { followerCount: { [Op.gte]: 100 } }
                        ]
                    },
                    required: true
                }],
                attributes: ['id', 'name', 'avatarUrl', 'bio'],
                order: [[{ model: DesignerProfile, as: 'designerProfile' }, 'followerCount', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.designers = designers;
        }

        // Get active live streams
        if (type === 'all' || type === 'live') {
            const liveStreams = await LiveStream.findAll({
                where: { status: 'live' },
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }],
                order: [['viewerCount', 'DESC']],
                limit: 10
            });

            results.liveStreams = liveStreams;
        }

        res.json(results);
    } catch (error) {
        console.error('Get explore feed error:', error);
        res.status(500).json({ error: 'Failed to fetch explore feed' });
    }
};

// Get personalized feed for logged-in user
exports.getPersonalizedFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        // Get users the current user follows
        const follows = await Follow.findAll({
            where: { followerId: userId },
            attributes: ['followingId']
        });

        const followingIds = follows.map(f => f.followingId);

        if (followingIds.length === 0) {
            // If not following anyone, return trending content
            return exports.getExploreFeed(req, res);
        }

        // Get posts from followed designers
        const posts = await Post.findAll({
            where: {
                designerId: { [Op.in]: followingIds },
                visibility: { [Op.in]: ['public', 'followers_only'] }
            },
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl'],
                include: [{
                    model: DesignerProfile,
                    as: 'designerProfile',
                    attributes: ['isVerified']
                }]
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get new products from followed designers
        const products = await Product.findAll({
            where: {
                designerId: { [Op.in]: followingIds },
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            },
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Get live streams from followed designers
        const liveStreams = await LiveStream.findAll({
            where: {
                designerId: { [Op.in]: followingIds },
                status: 'live'
            },
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl']
            }],
            order: [['startedAt', 'DESC']]
        });

        res.json({
            posts,
            products,
            liveStreams
        });
    } catch (error) {
        console.error('Get personalized feed error:', error);
        res.status(500).json({ error: 'Failed to fetch personalized feed' });
    }
};

// Search across platform
exports.search = async (req, res) => {
    try {
        const { q, type = 'all', limit = 20, offset = 0 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const searchTerm = q.trim();
        const results = {};

        // Search designers
        if (type === 'all' || type === 'designers') {
            const designers = await User.findAll({
                where: {
                    role: 'designer',
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { bio: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                include: [{
                    model: DesignerProfile,
                    as: 'designerProfile',
                    attributes: ['isVerified', 'followerCount']
                }],
                attributes: ['id', 'name', 'avatarUrl', 'bio'],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.designers = designers;
        }

        // Search products
        if (type === 'all' || type === 'products') {
            const products = await Product.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${searchTerm}%` } },
                        { description: { [Op.like]: `%${searchTerm}%` } },
                        { category: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.products = products;
        }

        // Search posts
        if (type === 'all' || type === 'posts') {
            const posts = await Post.findAll({
                where: {
                    visibility: 'public',
                    content: { [Op.like]: `%${searchTerm}%` }
                },
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            results.posts = posts;
        }

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
};

// Get trending tags
exports.getTrendingTags = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get all posts from last 7 days
        const posts = await Post.findAll({
            where: {
                visibility: 'public',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            attributes: ['tags', 'likeCount', 'commentCount']
        });

        // Count tag occurrences with engagement weight
        const tagCounts = {};
        posts.forEach(post => {
            const engagementScore = post.likeCount * 2 + post.commentCount;
            post.tags.forEach(tag => {
                if (!tagCounts[tag]) {
                    tagCounts[tag] = { count: 0, engagement: 0 };
                }
                tagCounts[tag].count += 1;
                tagCounts[tag].engagement += engagementScore;
            });
        });

        // Sort by engagement and count
        const trendingTags = Object.entries(tagCounts)
            .map(([tag, data]) => ({
                tag,
                count: data.count,
                engagement: data.engagement,
                score: data.engagement + data.count * 10
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit))
            .map(item => ({
                tag: item.tag,
                count: item.count
            }));

        res.json({ tags: trendingTags });
    } catch (error) {
        console.error('Get trending tags error:', error);
        res.status(500).json({ error: 'Failed to fetch trending tags' });
    }
};
