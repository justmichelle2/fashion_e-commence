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

app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = app;
