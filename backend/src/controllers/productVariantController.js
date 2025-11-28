const { ProductVariant, Product } = require('../models');

// Create product variant
exports.createVariant = async (req, res) => {
    try {
        const { productId, sku, size, color, priceCents, inventory, images } = req.body;

        // Check if product exists and user owns it
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to add variants to this product' });
        }

        // Check if SKU already exists
        if (sku) {
            const existingSku = await ProductVariant.findOne({ where: { sku } });
            if (existingSku) {
                return res.status(400).json({ error: 'SKU already exists' });
            }
        }

        const variant = await ProductVariant.create({
            productId,
            sku: sku || `${productId}-${size}-${color}`.replace(/\s+/g, '-').toLowerCase(),
            size,
            color,
            priceCents: priceCents || product.priceCents,
            inventory: inventory || 0,
            images: images || []
        });

        // Update product to indicate it has variants
        if (!product.hasVariants) {
            await product.update({ hasVariants: true });
        }

        res.status(201).json({
            message: 'Variant created',
            variant
        });
    } catch (error) {
        console.error('Create variant error:', error);
        res.status(500).json({ error: 'Failed to create variant' });
    }
};

// Get variants for a product
exports.getVariants = async (req, res) => {
    try {
        const { productId } = req.params;

        const variants = await ProductVariant.findAll({
            where: { productId },
            order: [['createdAt', 'ASC']]
        });

        res.json({ variants });
    } catch (error) {
        console.error('Get variants error:', error);
        res.status(500).json({ error: 'Failed to fetch variants' });
    }
};

// Get single variant
exports.getVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'designerId']
            }]
        });

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        res.json({ variant });
    } catch (error) {
        console.error('Get variant error:', error);
        res.status(500).json({ error: 'Failed to fetch variant' });
    }
};

// Update variant
exports.updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, size, color, priceCents, inventory, images } = req.body;

        const variant = await ProductVariant.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['designerId']
            }]
        });

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        if (variant.product.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this variant' });
        }

        // Check if new SKU already exists
        if (sku && sku !== variant.sku) {
            const existingSku = await ProductVariant.findOne({ where: { sku } });
            if (existingSku) {
                return res.status(400).json({ error: 'SKU already exists' });
            }
        }

        await variant.update({
            sku: sku !== undefined ? sku : variant.sku,
            size: size !== undefined ? size : variant.size,
            color: color !== undefined ? color : variant.color,
            priceCents: priceCents !== undefined ? priceCents : variant.priceCents,
            inventory: inventory !== undefined ? inventory : variant.inventory,
            images: images !== undefined ? images : variant.images
        });

        res.json({ message: 'Variant updated', variant });
    } catch (error) {
        console.error('Update variant error:', error);
        res.status(500).json({ error: 'Failed to update variant' });
    }
};

// Delete variant
exports.deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'designerId']
            }]
        });

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        if (variant.product.designerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this variant' });
        }

        const productId = variant.productId;
        await variant.destroy();

        // Check if product still has variants
        const remainingVariants = await ProductVariant.count({ where: { productId } });
        if (remainingVariants === 0) {
            await Product.update({ hasVariants: false }, { where: { id: productId } });
        }

        res.json({ message: 'Variant deleted' });
    } catch (error) {
        console.error('Delete variant error:', error);
        res.status(500).json({ error: 'Failed to delete variant' });
    }
};

// Update variant inventory
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { inventory } = req.body;

        if (inventory === undefined || inventory < 0) {
            return res.status(400).json({ error: 'Valid inventory count is required' });
        }

        const variant = await ProductVariant.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['designerId']
            }]
        });

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        if (variant.product.designerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this variant' });
        }

        await variant.update({ inventory });

        res.json({
            message: 'Inventory updated',
            inventory: variant.inventory
        });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
};
