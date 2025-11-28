const { Wishlist, Product, User } = require('../models');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if already in wishlist
        const existing = await Wishlist.findOne({
            where: { userId, productId }
        });

        if (existing) {
            return res.status(400).json({ error: 'Product already in wishlist' });
        }

        await Wishlist.create({ userId, productId });

        res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const wishlistItem = await Wishlist.findOne({
            where: { userId, productId }
        });

        if (!wishlistItem) {
            return res.status(404).json({ error: 'Product not in wishlist' });
        }

        await wishlistItem.destroy();

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

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
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const items = wishlistItems.map(item => ({
            id: item.id,
            productId: item.productId,
            addedAt: item.addedAt,
            product: item.product
        }));

        res.json({ items });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const wishlistItem = await Wishlist.findOne({
            where: { userId, productId }
        });

        res.json({ inWishlist: !!wishlistItem });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ error: 'Failed to check wishlist' });
    }
};
