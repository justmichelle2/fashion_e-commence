const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Like = sequelize.define('Like', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false },
        postId: { type: DataTypes.UUID, allowNull: false }
    }, {
        tableName: 'likes',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['postId'] },
            { fields: ['userId'] },
            { fields: ['userId', 'postId'], unique: true }
        ]
    });

    return Like;
};
