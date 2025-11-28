const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Analytics = sequelize.define('Analytics', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        designerId: { type: DataTypes.UUID, allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false },
        profileViews: { type: DataTypes.INTEGER, defaultValue: 0 },
        productViews: { type: DataTypes.INTEGER, defaultValue: 0 },
        orderCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        revenueCents: { type: DataTypes.INTEGER, defaultValue: 0 },
        newFollowers: { type: DataTypes.INTEGER, defaultValue: 0 },
        postEngagement: { type: DataTypes.JSON, defaultValue: {} }
    }, {
        tableName: 'analytics',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['designerId'] },
            { fields: ['date'] },
            { fields: ['designerId', 'date'], unique: true }
        ]
    });

    return Analytics;
};
