const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  storage: config.storage,
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
const VipRequest = require('./vipRequest')(sequelize);
const DesignerTemplate = require('./designerTemplate')(sequelize);
const DesignerPortfolio = require('./designerPortfolio')(sequelize);
const Inspiration = require('./inspiration')(sequelize);

// New models
const Post = require('./post')(sequelize);
const Follow = require('./follow')(sequelize);
const Like = require('./like')(sequelize);
const Comment = require('./comment')(sequelize);
const Conversation = require('./conversation')(sequelize);
const Message = require('./message')(sequelize);
const VideoCall = require('./videoCall')(sequelize);
const Notification = require('./notification')(sequelize);
const DesignerProfile = require('./designerProfile')(sequelize);
const ProductVariant = require('./productVariant')(sequelize);
const Wishlist = require('./wishlist')(sequelize);
const Analytics = require('./analytics')(sequelize);
const Withdrawal = require('./withdrawal')(sequelize);
const LiveStream = require('./liveStream')(sequelize);

// Existing Associations
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

User.hasMany(DesignerPortfolio, { as: 'portfolios', foreignKey: 'designerId' });
DesignerPortfolio.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

User.hasMany(Inspiration, { as: 'inspirations', foreignKey: 'userId' });
Inspiration.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

User.hasMany(VipRequest, { as: 'vipRequests', foreignKey: 'userId' });
VipRequest.belongsTo(User, { as: 'requester', foreignKey: 'userId' });

// New Associations

// Designer Profile (one-to-one)
User.hasOne(DesignerProfile, { as: 'designerProfile', foreignKey: 'userId' });
DesignerProfile.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Social Features
User.hasMany(Post, { as: 'posts', foreignKey: 'designerId' });
Post.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

Post.hasMany(Like, { as: 'likes', foreignKey: 'postId' });
Like.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Like.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Post.hasMany(Comment, { as: 'comments', foreignKey: 'postId' });
Comment.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentCommentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentCommentId' });

// Follow System
User.hasMany(Follow, { as: 'following', foreignKey: 'followerId' });
User.hasMany(Follow, { as: 'followers', foreignKey: 'followingId' });
Follow.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

// Messaging
Conversation.hasMany(Message, { as: 'messages', foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { as: 'conversation', foreignKey: 'conversationId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Video Calls
User.hasMany(VideoCall, { as: 'initiatedCalls', foreignKey: 'initiatorId' });
User.hasMany(VideoCall, { as: 'receivedCalls', foreignKey: 'receiverId' });
VideoCall.belongsTo(User, { as: 'initiator', foreignKey: 'initiatorId' });
VideoCall.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Notifications
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Product Variants
Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'productId' });
ProductVariant.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

// Wishlist
User.hasMany(Wishlist, { as: 'wishlistItems', foreignKey: 'userId' });
Product.hasMany(Wishlist, { as: 'wishlistedBy', foreignKey: 'productId' });
Wishlist.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Wishlist.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

// Analytics
User.hasMany(Analytics, { as: 'analytics', foreignKey: 'designerId' });
Analytics.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

// Withdrawals
User.hasMany(Withdrawal, { as: 'withdrawals', foreignKey: 'designerId' });
Withdrawal.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

// Live Streams
User.hasMany(LiveStream, { as: 'liveStreams', foreignKey: 'designerId' });
LiveStream.belongsTo(User, { as: 'designer', foreignKey: 'designerId' });

module.exports = {
  sequelize,
  User,
  Product,
  CustomOrder,
  Review,
  Order,
  ChatMessage,
  DesignerTemplate,
  OrderAuditLog,
  DesignerPortfolio,
  Inspiration,
  VipRequest,
  // New models
  Post,
  Follow,
  Like,
  Comment,
  Conversation,
  Message,
  VideoCall,
  Notification,
  DesignerProfile,
  ProductVariant,
  Wishlist,
  Analytics,
  Withdrawal,
  LiveStream
};
