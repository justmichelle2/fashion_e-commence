const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    status: {
      type: DataTypes.ENUM(
        'cart',
        'pending_payment',
        'paid',
        'in_production',
        'waiting_for_review',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'dispute_opened'
      ),
      defaultValue: 'cart',
    },
    type: { type: DataTypes.ENUM('standard', 'custom'), defaultValue: 'standard' },
    items: { type: DataTypes.JSON, defaultValue: [] },
    subtotalCents: { type: DataTypes.INTEGER, defaultValue: 0 },
    shippingCents: { type: DataTypes.INTEGER, defaultValue: 0 },
    taxCents: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalCents: { type: DataTypes.INTEGER, defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    paymentMethod: { type: DataTypes.STRING },
    shippingAddress: { type: DataTypes.JSON },
    notes: { type: DataTypes.TEXT },
    customOrderId: { type: DataTypes.UUID }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  return Order;
};
