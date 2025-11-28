const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false },
        type: {
            type: DataTypes.ENUM('order', 'message', 'follow', 'like', 'comment', 'live', 'custom_order', 'withdrawal'),
            allowNull: false
        },
        title: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        data: { type: DataTypes.JSON, defaultValue: {} },
        readAt: { type: DataTypes.DATE, allowNull: true },
        actionUrl: { type: DataTypes.STRING }
    }, {
        tableName: 'notifications',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['userId'] },
            { fields: ['readAt'] },
            { fields: ['type'] },
            { fields: ['createdAt'] }
        ]
    });

    return Notification;
};
