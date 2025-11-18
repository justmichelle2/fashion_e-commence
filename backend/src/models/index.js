const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: false,
});
// Initialize models
const User = require('./user')(sequelize);
const Product = require('./product')(sequelize);
const CustomOrder = require('./customOrder')(sequelize);
const Review = require('./review')(sequelize);
const Order = require('./order')(sequelize);
const OrderAuditLog = require('./orderAuditLog')(sequelize);
const ChatMessage = require('./chatMessage')(sequelize);
const DesignerTemplate = require('./designerTemplate')(sequelize);

// Associations
User.hasMany(Product, { as: 'products', foreignKey: 'designerId' });
Product.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });
User.hasMany(CustomOrder, { as: 'orders', foreignKey: 'customerId' });
CustomOrder.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
CustomOrder.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

User.hasMany(Order, { as: 'customerOrders', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });
Order.belongsTo(CustomOrder, { as: 'customOrder', foreignKey: 'customOrderId' });
Order.hasMany(OrderAuditLog, { as: 'auditLogs', foreignKey: 'orderId' });
OrderAuditLog.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
OrderAuditLog.belongsTo(User, { as: 'actor', foreignKey: 'changedBy' });

CustomOrder.hasMany(ChatMessage, { as: 'messages', foreignKey: 'customOrderId' });
ChatMessage.belongsTo(CustomOrder, { foreignKey: 'customOrderId' });
ChatMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

User.hasMany(DesignerTemplate, { as: 'templates', foreignKey: 'designerId' });
DesignerTemplate.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });
DesignerTemplate.hasMany(CustomOrder, { as: 'orders', foreignKey: 'templateId' });
CustomOrder.belongsTo(DesignerTemplate, { as: 'template', foreignKey: 'templateId' });

module.exports = { sequelize, User, Product, CustomOrder, Review, Order, ChatMessage, DesignerTemplate, OrderAuditLog };
