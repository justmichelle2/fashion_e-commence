const { DesignerPortfolio, User } = require('../models');
const { Op } = require('sequelize');

// Create portfolio item
exports.createPortfolioItem = async (req, res) => {
    try {
        const { title, description, images, visibility = 'public' } = req.body;
        const designerId = req.user.id;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can create portfolio items' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!images || images.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        const portfolioItem = await DesignerPortfolio.create({
            designerId,
            title: title.trim(),
            description: description?.trim() || '',
            images,
            visibility,
            featured: false
        });

        res.status(201).json({
            message: 'Portfolio item created',
            item: portfolioItem
        });
    } catch (error) {
        console.error('Create portfolio item error:', error);
        res.status(500).json({ error: 'Failed to create portfolio item' });
    }
};

// Get portfolio items
exports.getPortfolioItems = async (req, res) => {
    try {
        const { designerId, visibility, featured, limit = 20, offset = 0 } = req.query;
        const userId = req.user?.id;

        let whereClause = {};

        if (designerId) {
            whereClause.designerId = designerId;
        }

        // Only show public items unless viewing own portfolio
        if (!userId || userId !== designerId) {
            whereClause.visibility = 'public';
        } else if (visibility) {
            whereClause.visibility = visibility;
        }

        if (featured === 'true') {
            whereClause.featured = true;
        }

        const items = await DesignerPortfolio.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl']
            }],
            order: [
                ['featured', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const total = await DesignerPortfolio.count({ where: whereClause });

        res.json({ items, total });
    } catch (error) {
        console.error('Get portfolio items error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
};

// Get single portfolio item
exports.getPortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await DesignerPortfolio.findByPk(id, {
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl', 'bio']
            }]
        });

        if (!item) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        // Check visibility
        if (item.visibility !== 'public' && (!req.user || req.user.id !== item.designerId)) {
            return res.status(403).json({ error: 'Not authorized to view this item' });
        }

        res.json({ item });
    } catch (error) {
        console.error('Get portfolio item error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio item' });
    }
};

// Update portfolio item
exports.updatePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, visibility, featured } = req.body;

        const item = await DesignerPortfolio.findByPk(id);

        if (!item) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        if (item.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
        }

        await item.update({
            title: title !== undefined ? title.trim() : item.title,
            description: description !== undefined ? description.trim() : item.description,
            images: images !== undefined ? images : item.images,
            visibility: visibility !== undefined ? visibility : item.visibility,
            featured: featured !== undefined ? featured : item.featured
        });

        res.json({ message: 'Portfolio item updated', item });
    } catch (error) {
        console.error('Update portfolio item error:', error);
        res.status(500).json({ error: 'Failed to update portfolio item' });
    }
};

// Delete portfolio item
exports.deletePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await DesignerPortfolio.findByPk(id);

        if (!item) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        if (item.designerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this item' });
        }

        await item.destroy();

        res.json({ message: 'Portfolio item deleted' });
    } catch (error) {
        console.error('Delete portfolio item error:', error);
        res.status(500).json({ error: 'Failed to delete portfolio item' });
    }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await DesignerPortfolio.findByPk(id);

        if (!item) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        if (item.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
        }

        await item.update({ featured: !item.featured });

        res.json({
            message: item.featured ? 'Item featured' : 'Item unfeatured',
            featured: item.featured
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({ error: 'Failed to toggle featured status' });
    }
};
