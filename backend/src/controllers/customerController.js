const { User, Order, CustomOrder, Wishlist, Product } = require('../models');
const { Op } = require('sequelize');

// Get customer profile with stats
exports.getCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'avatarUrl', 'bio', 'location', 'measurementProfile', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get order stats
        const orderCount = await Order.count({
            where: {
                customerId: userId,
                status: { [Op.in]: ['delivered', 'completed'] }
            }
        });

        const customOrderCount = await CustomOrder.count({
            where: {
                customerId: userId,
                status: 'completed'
            }
        });

        const wishlistCount = await Wishlist.count({
            where: { userId }
        });

        res.json({
            user,
            stats: {
                totalOrders: orderCount,
                customOrders: customOrderCount,
                wishlistItems: wishlistCount
            }
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({ error: 'Failed to fetch customer profile' });
    }
};

// Update measurement profile
exports.updateMeasurements = async (req, res) => {
    try {
        const userId = req.user.id;
        const measurements = req.body;

        // Validate measurement data
        const validFields = [
            'height', 'weight', 'chest', 'waist', 'hips', 'inseam',
            'shoulder', 'sleeve', 'neck', 'shoeSize', 'unit'
        ];

        const filteredMeasurements = {};
        Object.keys(measurements).forEach(key => {
            if (validFields.includes(key)) {
                filteredMeasurements[key] = measurements[key];
            }
        });

        const user = await User.findByPk(userId);
        const currentMeasurements = user.measurementProfile || {};

        await user.update({
            measurementProfile: {
                ...currentMeasurements,
                ...filteredMeasurements,
                updatedAt: new Date()
            }
        });

        res.json({
            message: 'Measurements updated',
            measurementProfile: user.measurementProfile
        });
    } catch (error) {
        console.error('Update measurements error:', error);
        res.status(500).json({ error: 'Failed to update measurements' });
    }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'all', status, limit = 20, offset = 0 } = req.query;

        let results = {};

        // Get standard orders
        if (type === 'all' || type === 'standard') {
            let whereClause = { customerId: userId };
            if (status) {
                whereClause.status = status;
            }

            const orders = await Order.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }]
            });

            results.orders = orders;
        }

        // Get custom orders
        if (type === 'all' || type === 'custom') {
            let whereClause = { customerId: userId };
            if (status) {
                whereClause.status = status;
            }

            const customOrders = await CustomOrder.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }]
            });

            results.customOrders = customOrders;
        }

        res.json(results);
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({ error: 'Failed to fetch order history' });
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { type = 'standard' } = req.query;
        const userId = req.user.id;

        let order;

        if (type === 'custom') {
            order = await CustomOrder.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'designer',
                        attributes: ['id', 'name', 'avatarUrl', 'email']
                    },
                    {
                        model: User,
                        as: 'customer',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        } else {
            order = await Order.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'designer',
                        attributes: ['id', 'name', 'avatarUrl', 'email']
                    },
                    {
                        model: User,
                        as: 'customer',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify user owns this order
        if (order.customerId !== userId && order.designerId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
};

// Get favorites (products + designers)
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get wishlisted products
        const wishlistItems = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                include: [{
                    model: User,
                    as: 'designer',
                    attributes: ['id', 'name', 'avatarUrl']
                }]
            }],
            order: [['addedAt', 'DESC']],
            limit: 50
        });

        // Get followed designers
        const { Follow } = require('../models');
        const follows = await Follow.findAll({
            where: { followerId: userId },
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'name', 'avatarUrl', 'bio'],
                include: [{
                    model: require('../models').DesignerProfile,
                    as: 'designerProfile',
                    attributes: ['isVerified', 'followerCount']
                }]
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            wishlist: wishlistItems.map(item => ({
                ...item.product.toJSON(),
                addedAt: item.addedAt
            })),
            followedDesigners: follows.map(f => f.following)
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};

// Get recommended products
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20 } = req.query;

        // Get user's wishlist to understand preferences
        const wishlistItems = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['category', 'tags']
            }],
            limit: 10
        });

        // Extract categories and tags
        const categories = new Set();
        const tags = new Set();

        wishlistItems.forEach(item => {
            if (item.product.category) categories.add(item.product.category);
            if (item.product.tags) {
                item.product.tags.forEach(tag => tags.add(tag));
            }
        });

        // Get products matching preferences
        let whereClause = {};

        if (categories.size > 0 || tags.size > 0) {
            whereClause[Op.or] = [];

            if (categories.size > 0) {
                whereClause[Op.or].push({
                    category: { [Op.in]: Array.from(categories) }
                });
            }
        }

        const recommendations = await Product.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl']
            }],
            order: [
                ['averageRating', 'DESC'],
                ['viewCount', 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json({ recommendations });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};
