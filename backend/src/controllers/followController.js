const { Follow, User, DesignerProfile } = require('../models');

// Follow a designer
exports.followDesigner = async (req, res) => {
    try {
        const { followingId } = req.body;
        const followerId = req.user.id;

        if (followerId === followingId) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }

        // Check if designer exists
        const designer = await User.findByPk(followingId);
        if (!designer || designer.role !== 'designer') {
            return res.status(404).json({ error: 'Designer not found' });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            where: { followerId, followingId }
        });

        if (existingFollow) {
            return res.status(400).json({ error: 'Already following this designer' });
        }

        const follow = await Follow.create({
            followerId,
            followingId,
            notificationsEnabled: true
        });

        // Update designer follower count
        const designerProfile = await DesignerProfile.findOne({ where: { userId: followingId } });
        if (designerProfile) {
            await designerProfile.increment('followerCount');
        }

        // TODO: Create notification for designer

        res.status(201).json({ message: 'Following designer', follow });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: 'Failed to follow designer' });
    }
};

// Unfollow a designer
exports.unfollowDesigner = async (req, res) => {
    try {
        const { followingId } = req.params;
        const followerId = req.user.id;

        const follow = await Follow.findOne({
            where: { followerId, followingId }
        });

        if (!follow) {
            return res.status(404).json({ error: 'Not following this designer' });
        }

        await follow.destroy();

        // Update designer follower count
        const designerProfile = await DesignerProfile.findOne({ where: { userId: followingId } });
        if (designerProfile) {
            await designerProfile.decrement('followerCount');
        }

        res.json({ message: 'Unfollowed designer' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ error: 'Failed to unfollow designer' });
    }
};

// Get designer's followers
exports.getFollowers = async (req, res) => {
    try {
        const { designerId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const followers = await Follow.findAll({
            where: { followingId: designerId },
            include: [{
                model: User,
                as: 'follower',
                attributes: ['id', 'name', 'avatarUrl', 'role']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const total = await Follow.count({ where: { followingId: designerId } });

        const followersList = followers.map(f => ({
            ...f.follower.toJSON(),
            followedAt: f.createdAt
        }));

        res.json({ followers: followersList, total });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
};

// Get user's following list
exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const following = await Follow.findAll({
            where: { followerId: userId },
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'name', 'avatarUrl', 'role'],
                include: [{
                    model: DesignerProfile,
                    as: 'designerProfile',
                    attributes: ['isVerified']
                }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const total = await Follow.count({ where: { followerId: userId } });

        const followingList = following.map(f => ({
            ...f.following.toJSON(),
            isVerified: f.following.designerProfile?.isVerified || false,
            followedAt: f.createdAt
        }));

        res.json({ following: followingList, total });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ error: 'Failed to fetch following list' });
    }
};

// Check if user follows designer
exports.checkFollowStatus = async (req, res) => {
    try {
        const { designerId } = req.params;
        const userId = req.user.id;

        const follow = await Follow.findOne({
            where: { followerId: userId, followingId: designerId }
        });

        res.json({ isFollowing: !!follow });
    } catch (error) {
        console.error('Check follow status error:', error);
        res.status(500).json({ error: 'Failed to check follow status' });
    }
};
