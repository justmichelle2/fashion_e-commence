const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const customOrderRoutes = require('./routes/customOrders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const designerRoutes = require('./routes/designers');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');
const dashboardRoutes = require('./routes/dashboard');
const templateRoutes = require('./routes/templates');
const localeRoutes = require('./routes/locales');
const currencyRoutes = require('./routes/currencies');
const vipRoutes = require('./routes/vip');
// New routes
const postRoutes = require('./routes/posts');
const followRoutes = require('./routes/follows');
const messageRoutes = require('./routes/messages');
const designerProfileRoutes = require('./routes/designerProfiles');
const videoCallRoutes = require('./routes/videoCalls');
const liveStreamRoutes = require('./routes/liveStreams');
const withdrawalRoutes = require('./routes/withdrawals');
const notificationRoutes = require('./routes/notifications');
const wishlistRoutes = require('./routes/wishlists');
const portfolioRoutes = require('./routes/portfolios');
const productVariantRoutes = require('./routes/productVariants');
const exploreRoutes = require('./routes/explore');
const customerRoutes = require('./routes/customers');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/locales', localeRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/vip', vipRoutes);
// New routes
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/designer-profiles', designerProfileRoutes);
app.use('/api/video-calls', videoCallRoutes);
app.use('/api/live-streams', liveStreamRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = app;
