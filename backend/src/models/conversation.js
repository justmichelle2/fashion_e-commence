const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Conversation = sequelize.define('Conversation', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        participant1Id: { type: DataTypes.UUID, allowNull: false },
        participant2Id: { type: DataTypes.UUID, allowNull: false },
        lastMessageAt: { type: DataTypes.DATE },
        lastMessagePreview: { type: DataTypes.STRING }
    }, {
        tableName: 'conversations',
        timestamps: true,
        indexes: [
            { fields: ['participant1Id'] },
            { fields: ['participant2Id'] },
            { fields: ['participant1Id', 'participant2Id'], unique: true },
            { fields: ['lastMessageAt'] }
        ]
    });

    return Conversation;
};
