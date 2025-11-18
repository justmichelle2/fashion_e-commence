const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomOrder = sequelize.define('CustomOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    inspirationImages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    size: { type: DataTypes.STRING },
    colorPalette: { type: DataTypes.STRING },
    fabricPreference: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
    templateId: { type: DataTypes.UUID },
    status: { type: DataTypes.ENUM('requested','quoted','in_progress','awaiting_approval','in_production','delivered','completed','rejected'), defaultValue: 'requested' },
    progressStep: { type: DataTypes.ENUM('brief','sketch','approval','production','shipping','done'), defaultValue: 'brief' },
    quoteCents: { type: DataTypes.INTEGER },
    depositCents: { type: DataTypes.INTEGER },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    paymentStatus: { type: DataTypes.ENUM('pending','deposit_paid','paid_in_full','refunded'), defaultValue: 'pending' },
    estimatedDeliveryDays: { type: DataTypes.INTEGER },
    shippingAddress: { type: DataTypes.JSONB },
    trackingUrl: { type: DataTypes.STRING }
  }, {
    tableName: 'custom_orders',
    timestamps: true
  });

  return CustomOrder;
};
