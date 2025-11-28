const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Follow = sequelize.define('Follow', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        followerId: { type: DataTypes.UUID, allowNull: false },
        followingId: { type: DataTypes.UUID, allowNull: false },
        notificationsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'follows',
        timestamps: true,
        indexes: [
            { fields: ['followerId'] },
            { fields: ['followingId'] },
            { fields: ['followerId', 'followingId'], unique: true }
        ]
    });

    return Follow;
};
