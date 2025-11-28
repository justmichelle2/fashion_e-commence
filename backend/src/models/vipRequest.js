const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const VipRequest = sequelize.define(
    'VipRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      experienceId: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      notes: { type: DataTypes.TEXT },
      productId: { type: DataTypes.UUID },
      productTitle: { type: DataTypes.STRING },
      adminComment: { type: DataTypes.TEXT },
      resolvedBy: { type: DataTypes.UUID },
      resolvedAt: { type: DataTypes.DATE },
    },
    {
      tableName: 'vip_requests',
      timestamps: true,
    },
  )

  return VipRequest
}
