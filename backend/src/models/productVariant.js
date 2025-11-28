const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ProductVariant = sequelize.define('ProductVariant', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        productId: { type: DataTypes.UUID, allowNull: false },
        sku: { type: DataTypes.STRING, unique: true },
        size: { type: DataTypes.STRING },
        color: { type: DataTypes.STRING },
        priceCents: { type: DataTypes.INTEGER, allowNull: false },
        inventory: { type: DataTypes.INTEGER, defaultValue: 0 },
        images: { type: DataTypes.JSON, defaultValue: [] }
    }, {
        tableName: 'product_variants',
        timestamps: true,
        indexes: [
            { fields: ['productId'] },
            { fields: ['sku'], unique: true }
        ]
    });

    return ProductVariant;
};
