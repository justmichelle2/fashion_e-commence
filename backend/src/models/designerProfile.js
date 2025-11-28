const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DesignerProfile = sequelize.define('DesignerProfile', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false, unique: true },
        bannerUrl: { type: DataTypes.STRING },
        specializations: { type: DataTypes.JSON, defaultValue: [] },
        yearsExperience: { type: DataTypes.INTEGER, defaultValue: 0 },
        certifications: { type: DataTypes.JSON, defaultValue: [] },
        socialLinks: { type: DataTypes.JSON, defaultValue: {} },
        isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
        followerCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
        averageRating: { type: DataTypes.FLOAT, defaultValue: 0 },
        responseTimeHours: { type: DataTypes.INTEGER, defaultValue: 24 }
    }, {
        tableName: 'designer_profiles',
        timestamps: true,
        indexes: [
            { fields: ['userId'], unique: true },
            { fields: ['isVerified'] },
            { fields: ['averageRating'] }
        ]
    });

    return DesignerProfile;
};
