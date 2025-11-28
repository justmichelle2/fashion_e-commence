const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        designerId: { type: DataTypes.UUID, allowNull: false },
        content: { type: DataTypes.TEXT },
        mediaUrls: { type: DataTypes.JSON, defaultValue: [] },
        mediaType: {
            type: DataTypes.ENUM('image', 'video', 'reel'),
            defaultValue: 'image'
        },
        tags: { type: DataTypes.JSON, defaultValue: [] },
        likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
        visibility: {
            type: DataTypes.ENUM('public', 'followers_only', 'private'),
            defaultValue: 'public'
        }
    }, {
        tableName: 'posts',
        timestamps: true,
        indexes: [
            { fields: ['designerId'] },
            { fields: ['createdAt'] },
            { fields: ['visibility'] }
        ]
    });

    return Post;
};
