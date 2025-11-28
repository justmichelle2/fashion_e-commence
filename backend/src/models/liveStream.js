const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LiveStream = sequelize.define('LiveStream', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        designerId: { type: DataTypes.UUID, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        streamKey: { type: DataTypes.STRING }, // Agora channel name or token
        agoraAppId: { type: DataTypes.STRING },
        agoraToken: { type: DataTypes.TEXT },
        status: {
            type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'),
            defaultValue: 'scheduled'
        },
        scheduledAt: { type: DataTypes.DATE },
        startedAt: { type: DataTypes.DATE },
        endedAt: { type: DataTypes.DATE },
        viewerCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        peakViewerCount: { type: DataTypes.INTEGER, defaultValue: 0 }
    }, {
        tableName: 'live_streams',
        timestamps: true,
        indexes: [
            { fields: ['designerId'] },
            { fields: ['status'] },
            { fields: ['startedAt'] }
        ]
    });

    return LiveStream;
};
