const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false },
        postId: { type: DataTypes.UUID, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        parentCommentId: { type: DataTypes.UUID, allowNull: true }
    }, {
        tableName: 'comments',
        timestamps: true,
        indexes: [
            { fields: ['postId'] },
            { fields: ['userId'] },
            { fields: ['parentCommentId'] }
        ]
    });

    return Comment;
};
