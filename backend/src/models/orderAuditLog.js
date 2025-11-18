const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderAuditLog = sequelize.define(
    'OrderAuditLog',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      orderId: { type: DataTypes.UUID, allowNull: false },
      field: { type: DataTypes.STRING, allowNull: false },
      previousValue: { type: DataTypes.JSONB },
      newValue: { type: DataTypes.JSONB },
      comment: { type: DataTypes.TEXT },
      changedBy: { type: DataTypes.UUID },
    },
    {
      tableName: 'order_audit_logs',
      timestamps: true,
      updatedAt: false,
    }
  );

  return OrderAuditLog;
};
