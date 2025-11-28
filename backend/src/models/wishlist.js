const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Wishlist = sequelize.define('Wishlist', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false },
        productId: { type: DataTypes.UUID, allowNull: false },
        addedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'wishlists',
        timestamps: false,
        indexes: [
            { fields: ['userId'] },
            { fields: ['productId'] },
            { fields: ['userId', 'productId'], unique: true }
        ]
    });

    return Wishlist;
};
