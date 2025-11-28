const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Message = sequelize.define('Message', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        senderId: { type: DataTypes.UUID, allowNull: false },
        receiverId: { type: DataTypes.UUID, allowNull: false },
        conversationId: { type: DataTypes.UUID, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        mediaUrls: { type: DataTypes.JSON, defaultValue: [] },
        readAt: { type: DataTypes.DATE, allowNull: true },
        messageType: {
            type: DataTypes.ENUM('text', 'image', 'video', 'file'),
            defaultValue: 'text'
        }
    }, {
        tableName: 'messages',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['conversationId'] },
            { fields: ['senderId'] },
            { fields: ['receiverId'] },
            { fields: ['createdAt'] },
            { fields: ['readAt'] }
        ]
    });

    return Message;
};
