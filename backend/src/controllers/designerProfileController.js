const { DesignerProfile, User, Analytics } = require('../models');
const { Op } = require('sequelize');

// Get designer profile
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'avatarUrl', 'bio', 'location', 'role']
        });

        if (!user || user.role !== 'designer') {
            return res.status(404).json({ error: 'Designer not found' });
        }

        let profile = await DesignerProfile.findOne({ where: { userId } });

        // Create profile if it doesn't exist
        if (!profile) {
            profile = await DesignerProfile.create({ userId });
        }

        res.json({
            ...profile.toJSON(),
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Get designer profile error:', error);
        res.status(500).json({ error: 'Failed to fetch designer profile' });
    }
};

// Update designer profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            bannerUrl,
            specializations,
            yearsExperience,
            certifications,
            socialLinks
        } = req.body;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can update designer profile' });
        }

        let profile = await DesignerProfile.findOne({ where: { userId } });

        if (!profile) {
            profile = await DesignerProfile.create({ userId });
        }

        await profile.update({
            bannerUrl: bannerUrl !== undefined ? bannerUrl : profile.bannerUrl,
            specializations: specializations !== undefined ? specializations : profile.specializations,
            yearsExperience: yearsExperience !== undefined ? yearsExperience : profile.yearsExperience,
            certifications: certifications !== undefined ? certifications : profile.certifications,
            socialLinks: socialLinks !== undefined ? socialLinks : profile.socialLinks
        });

        res.json({ message: 'Profile updated', profile });
    } catch (error) {
        console.error('Update designer profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
    try {
        const designerId = req.user.id;
        const { startDate, endDate } = req.query;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can view analytics' });
        }

        let whereClause = { designerId };

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else {
            // Default to last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            whereClause.date = {
                [Op.gte]: thirtyDaysAgo
            };
        }

        const analytics = await Analytics.findAll({
            where: whereClause,
            order: [['date', 'ASC']]
        });

        // Calculate summary
        const summary = analytics.reduce((acc, day) => {
            return {
                totalRevenue: acc.totalRevenue + day.revenueCents,
                totalOrders: acc.totalOrders + day.orderCount,
                totalViews: acc.totalViews + (day.profileViews + day.productViews),
                newFollowers: acc.newFollowers + day.newFollowers
            };
        }, { totalRevenue: 0, totalOrders: 0, totalViews: 0, newFollowers: 0 });

        res.json({
            summary,
            dailyData: analytics
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// Get revenue breakdown
exports.getRevenue = async (req, res) => {
    try {
        const designerId = req.user.id;
        const { startDate, endDate } = req.query;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can view revenue' });
        }

        // TODO: Calculate from actual orders
        // This is a placeholder implementation

        res.json({
            totalRevenue: 0,
            availableBalance: 0,
            pendingBalance: 0,
            revenueByProduct: []
        });
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue' });
    }
};
