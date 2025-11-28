const { Op } = require('sequelize');
const { User, Order, OrderAuditLog, CustomOrder } = require('../models');
const { recordOrderAudit } = require('../utils/orderAudit');
const { ORDER_STATUSES, canTransition, formatOrderResponse } = require('../utils/orderUtils');

const ADMIN_ORDER_INCLUDE = [
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'designer', attributes: ['id', 'name', 'email'] },
  { model: CustomOrder, as: 'customOrder', attributes: ['id', 'title', 'status'] },
];

function collectChange(order, field, newValue){
  const previousValue = order[field];
  if(JSON.stringify(previousValue) === JSON.stringify(newValue)) return null;
  order[field] = newValue;
  return { field, previousValue, newValue };
}

async function buildOrderSummary(){
  const [pending, inProduction, escalations] = await Promise.all([
    Order.count({ where: { status: 'pending_payment' } }),
    Order.count({ where: { status: 'in_production' } }),
    Order.count({ where: { status: { [Op.in]: ['cancelled', 'refunded', 'dispute_opened'] } } }),
  ]);
  return { pending, inProduction, escalations };
}

async function listUsers(req, res){
  const users = await User.findAll({ attributes: ['id','name','email','role','verified','createdAt','notificationPrefs'] });
  res.json({ users });
}

async function approveDesigner(req, res){
  const { id } = req.params;
  const user = await User.findByPk(id);
  if(!user) return res.status(404).json({ error: 'User not found' });
  user.verified = true;
  if(user.role !== 'designer') user.role = 'designer';
  await user.save();
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, verified: user.verified } });
}

async function changeRole(req, res){
  const { id } = req.params;
  const { role } = req.body;
  if(!['customer','designer','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByPk(id);
  if(!user) return res.status(404).json({ error: 'User not found' });
  user.role = role;
  await user.save();
  res.json({ user: { id: user.id, role: user.role } });
}

async function approveKyc(req, res){
  const { id } = req.params;
  const user = await User.findByPk(id);
  if(!user) return res.status(404).json({ error: 'User not found' });
  user.kycStatus = 'approved';
  await user.save();
  res.json({ user: { id: user.id, kycStatus: user.kycStatus } });
}

async function listAdminOrders(req, res){
  try {
    const {
      status,
      limit = 20,
      page = 1,
      customer,
      designer,
      from,
      to,
    } = req.query;
    const perPage = Math.min(parseInt(limit, 10) || 20, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const where = {};
    if(status && status !== 'all'){
      if(!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status filter' });
      where.status = status;
    }
    if(from || to){
      where.createdAt = {};
      if(from){
        const fromDate = new Date(from);
        if(!Number.isNaN(fromDate.getTime())) where.createdAt[Op.gte] = fromDate;
      }
      if(to){
        const toDate = new Date(to);
        if(!Number.isNaN(toDate.getTime())) where.createdAt[Op.lte] = toDate;
      }
      if(!Object.keys(where.createdAt).length) delete where.createdAt;
    }
    const include = [
      {
        ...ADMIN_ORDER_INCLUDE[0],
        ...(customer
          ? { where: { name: { [Op.iLike]: `%${customer}%` } }, required: true }
          : {}),
      },
      {
        ...ADMIN_ORDER_INCLUDE[1],
        ...(designer
          ? { where: { name: { [Op.iLike]: `%${designer}%` } }, required: true }
          : {}),
      },
      ADMIN_ORDER_INCLUDE[2],
    ];
    const { rows, count } = await Order.findAndCountAll({
      where,
      include,
      order: [['createdAt','DESC']],
      limit: perPage,
      offset: (currentPage - 1) * perPage,
    });
    const summary = await buildOrderSummary();
    res.json({
      orders: rows.map(formatOrderResponse),
      pagination: { page: currentPage, limit: perPage, total: count, pages: Math.ceil(count / perPage) },
      summary,
    });
  } catch (err) {
    console.error('listAdminOrders error', err);
    res.status(500).json({ error: 'Unable to load admin orders' });
  }
}

async function getAdminOrder(req, res){
  try {
    const order = await Order.findByPk(req.params.id, { include: ADMIN_ORDER_INCLUDE });
    if(!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrderResponse(order) });
  } catch(err){
    console.error('getAdminOrder error', err);
    res.status(500).json({ error: 'Unable to load order' });
  }
}

async function adminUpdateOrder(req, res){
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { include: ADMIN_ORDER_INCLUDE });
    if(!order) return res.status(404).json({ error: 'Order not found' });
    const {
      status,
      designerId,
      notes,
      subtotalCents,
      taxCents,
      shippingCents,
      totalCents,
      comment,
      shippingAddress,
    } = req.body || {};
    const changes = [];
    if(status){
      if(!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      if(!canTransition(order.status, status)) return res.status(400).json({ error: 'Status transition not allowed' });
      const change = collectChange(order, 'status', status);
      if(change) changes.push(change);
    }
    if(designerId !== undefined){
      const change = collectChange(order, 'designerId', designerId || null);
      if(change) changes.push(change);
    }
    if(typeof notes === 'string'){
      const change = collectChange(order, 'notes', notes);
      if(change) changes.push(change);
    }
    if(shippingAddress){
      const change = collectChange(order, 'shippingAddress', shippingAddress);
      if(change) changes.push(change);
    }
    ['subtotalCents','taxCents','shippingCents','totalCents'].forEach((field) => {
      if(req.body[field] !== undefined){
        const value = Number(req.body[field]);
        if(Number.isFinite(value)){
          const change = collectChange(order, field, value);
          if(change) changes.push(change);
        }
      }
    });
    if(!changes.length) return res.json({ order: formatOrderResponse(order) });
    await order.save();
    await Promise.all(
      changes.map((change) =>
        recordOrderAudit({
          orderId: order.id,
          field: change.field,
          previousValue: change.previousValue,
          newValue: change.newValue,
          changedBy: req.user.id,
          comment: comment || 'Admin update',
        })
      )
    );
    await order.reload({ include: ADMIN_ORDER_INCLUDE });
    res.json({ order: formatOrderResponse(order) });
  } catch(err){
    console.error('adminUpdateOrder error', err);
    res.status(500).json({ error: 'Unable to update order' });
  }
}

async function getOrderAuditTrail(req, res){
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const { rows, count } = await OrderAuditLog.findAndCountAll({
      where: { orderId: id },
      include: [{ model: User, as: 'actor', attributes: ['id','name','email'] }],
      order: [['createdAt','DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({
      logs: rows.map((log) => ({
        id: log.id,
        field: log.field,
        previousValue: log.previousValue,
        newValue: log.newValue,
        comment: log.comment,
        changedBy: log.changedBy,
        actor: log.actor ? { id: log.actor.id, name: log.actor.name, email: log.actor.email } : null,
        createdAt: log.createdAt,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch(err){
    console.error('getOrderAuditTrail error', err);
    res.status(500).json({ error: 'Unable to load audit trail' });
  }
}

module.exports = {
  listUsers,
  approveDesigner,
  changeRole,
  approveKyc,
  listAdminOrders,
  getAdminOrder,
  adminUpdateOrder,
  getOrderAuditTrail,
};
