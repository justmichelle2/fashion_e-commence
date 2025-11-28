const express = require('express');
const router = express.Router();
const { adminOnly } = require('../utils/roles');
const {
	listUsers,
	approveDesigner,
	changeRole,
	approveKyc,
	listAdminOrders,
	getAdminOrder,
	adminUpdateOrder,
	getOrderAuditTrail,
} = require('../controllers/adminController');
const {
	listVipCatalog,
	assignVipExperience,
	listVipRequestsAdmin,
	updateVipRequestStatus,
} = require('../controllers/vipController');
const { authMiddleware } = require('../utils/jwt');

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminOnly);

router.get('/users', listUsers);
router.post('/users/:id/approve-designer', approveDesigner);
router.post('/users/:id/role', changeRole);
router.post('/users/:id/approve-kyc', approveKyc);
router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.patch('/orders/:id', adminUpdateOrder);
router.get('/orders/:id/audit', getOrderAuditTrail);
router.get('/vip/experiences', listVipCatalog);
router.post('/vip/experiences', assignVipExperience);
router.get('/vip/requests', listVipRequestsAdmin);
router.post('/vip/requests/:id/status', updateVipRequestStatus);

module.exports = router;
