const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const VideoCall = sequelize.define('VideoCall', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        initiatorId: { type: DataTypes.UUID, allowNull: false },
        receiverId: { type: DataTypes.UUID, allowNull: false },
        roomId: { type: DataTypes.STRING, allowNull: false },
        status: {
            type: DataTypes.ENUM('pending', 'active', 'ended', 'missed'),
            defaultValue: 'pending'
        },
        startedAt: { type: DataTypes.DATE },
        endedAt: { type: DataTypes.DATE },
        durationSeconds: { type: DataTypes.INTEGER, defaultValue: 0 },
        callType: {
            type: DataTypes.ENUM('fitting', 'consultation', 'general'),
            defaultValue: 'general'
        }
    }, {
        tableName: 'video_calls',
        timestamps: true,
        indexes: [
            { fields: ['initiatorId'] },
            { fields: ['receiverId'] },
            { fields: ['roomId'] },
            { fields: ['status'] }
        ]
    });

    return VideoCall;
};
