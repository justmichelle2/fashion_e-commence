const { Order, Product, CustomOrder, User } = require('../models');
const { validate, schemas } = require('../utils/validators');
const { recordOrderAudit } = require('../utils/orderAudit');
const { ORDER_STATUSES, canTransition, formatOrderResponse } = require('../utils/orderUtils');

const ORDER_INCLUDE = [
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'designer', attributes: ['id', 'name', 'email'] },
  { model: CustomOrder, as: 'customOrder', attributes: ['id', 'title', 'status'] },
];

async function getOrCreateCart(userId){
  let order = await Order.findOne({ where: { customerId: userId, status: 'cart' } });
  if(!order){
    order = await Order.create({ customerId: userId, status: 'cart', items: [], subtotalCents: 0, totalCents: 0 });
  }
  return order;
}

async function loadOrderForUser(orderId, user){
  const order = await Order.findByPk(orderId, { include: ORDER_INCLUDE });
  if(!order) return null;
  if(user.role === 'admin') return order;
  if(user.role === 'customer' && order.customerId === user.id) return order;
  if(user.role === 'designer' && order.designerId === user.id) return order;
  return null;
}

function collectFieldChange(order, field, newValue){
  const previousValue = order[field];
  if(JSON.stringify(previousValue) === JSON.stringify(newValue)) return null;
  order[field] = newValue;
  return { previousValue, newValue };
}

async function saveOrderWithAudit(order, changes, userId, defaultComment){
  await order.save();
  if(!Array.isArray(changes) || !changes.length) return;
  await Promise.all(
    changes.map((change) =>
      recordOrderAudit({
        orderId: order.id,
        field: change.field,
        previousValue: change.previousValue,
        newValue: change.newValue,
        changedBy: userId,
        comment: change.comment || defaultComment || null,
      })
    )
  );
}

async function getCart(req, res){
  try{
    const order = await getOrCreateCart(req.user.id);
    return res.json({ order });
  }catch(err){
    console.error('getCart error', err);
    return res.status(500).json({ error: 'Unable to load cart' });
  }
}

async function addToCart(req, res){
  try{
    const parsed = validate(schemas.cartAdd, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const { productId, quantity } = parsed.data;

    const product = await Product.findByPk(productId);
    if(!product) return res.status(404).json({ error: 'Product not found' });

    const order = await getOrCreateCart(req.user.id);
    const items = Array.isArray(order.items) ? [...order.items] : [];
    const idx = items.findIndex(i => i.productId === productId);
    if(idx >= 0){
      items[idx].quantity = Math.min(items[idx].quantity + quantity, 10);
    }else{
      items.push({
        productId,
        title: product.title,
        designerId: product.designerId,
        designerName: product.designerName,
        priceCents: product.priceCents,
        currency: product.currency,
        image: product.images?.[0],
        quantity,
      });
    }
    order.items = items;
    order.subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    order.taxCents = Math.round(order.subtotalCents * 0.08);
    order.shippingCents = order.subtotalCents > 30000 ? 0 : 1500;
    order.totalCents = order.subtotalCents + order.taxCents + order.shippingCents;
    order.currency = product.currency;
    await order.save();
    return res.json({ order });
  }catch(err){
    console.error('addToCart error', err);
    return res.status(500).json({ error: 'Unable to update cart' });
  }
}

async function removeFromCart(req, res){
  try{
    const parsed = validate(schemas.cartRemove, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const { productId } = parsed.data;
    const order = await getOrCreateCart(req.user.id);
    order.items = (order.items || []).filter(i => i.productId !== productId);
    order.subtotalCents = order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    order.taxCents = Math.round(order.subtotalCents * 0.08);
    order.shippingCents = order.subtotalCents > 30000 ? 0 : 1500;
    order.totalCents = order.subtotalCents + order.taxCents + order.shippingCents;
    await order.save();
    return res.json({ order });
  }catch(err){
    console.error('removeFromCart error', err);
    return res.status(500).json({ error: 'Unable to update cart' });
  }
}

async function checkout(req, res){
  try{
    const parsed = validate(schemas.checkout, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const { shippingAddress, paymentMethod } = parsed.data;
    const order = await getOrCreateCart(req.user.id);
    if(!order.items.length) return res.status(400).json({ error: 'Cart is empty' });
    const previousStatus = order.status;
    order.status = 'pending_payment';
    order.shippingAddress = shippingAddress;
    order.paymentMethod = paymentMethod;
    await order.save();
    await recordOrderAudit({
      orderId: order.id,
      field: 'status',
      previousValue: previousStatus,
      newValue: order.status,
      changedBy: req.user.id,
      comment: 'Customer submitted checkout',
    });
    await order.reload({ include: ORDER_INCLUDE });
    res.json({ order: formatOrderResponse(order), clientSecret: 'demo-client-secret', paymentGateway: 'stripe' });
  }catch(err){
    console.error('checkout error', err);
    res.status(500).json({ error: 'Unable to submit checkout' });
  }
}

async function listOrders(req, res){
  try{
    let where = {};
    if(req.user.role === 'customer') where.customerId = req.user.id;
    if(req.user.role === 'designer') where.designerId = req.user.id;
    const orders = await Order.findAll({ where, order: [['createdAt','DESC']], limit: 50, include: ORDER_INCLUDE });
    res.json({ orders: orders.map(formatOrderResponse) });
  }catch(err){
    console.error('listOrders error', err);
    res.status(500).json({ error: 'Unable to load orders' });
  }
}

async function getOrderById(req, res){
  try {
    const order = await loadOrderForUser(req.params.id, req.user);
    if(!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrderResponse(order) });
  } catch(err){
    console.error('getOrderById error', err);
    res.status(500).json({ error: 'Unable to load order' });
  }
}

async function updateOrder(req, res){
  try {
    const order = await loadOrderForUser(req.params.id, req.user);
    if(!order) return res.status(404).json({ error: 'Order not found' });
    const { shippingAddress, notes, status } = req.body || {};
    const auditChanges = [];
    if(shippingAddress){
      const change = collectFieldChange(order, 'shippingAddress', shippingAddress);
      if(change) auditChanges.push({ field: 'shippingAddress', ...change });
    }
    if(typeof notes === 'string'){
      const change = collectFieldChange(order, 'notes', notes);
      if(change) auditChanges.push({ field: 'notes', ...change });
    }
    if(status){
      if(!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      if(req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins may change status' });
      if(!canTransition(order.status, status)) return res.status(400).json({ error: 'Status transition not allowed' });
      const change = collectFieldChange(order, 'status', status);
      if(change) auditChanges.push({ field: 'status', ...change });
    }
    if(!auditChanges.length) return res.json({ order: formatOrderResponse(order) });
    await saveOrderWithAudit(order, auditChanges, req.user.id, 'Order updated');
    await order.reload({ include: ORDER_INCLUDE });
    res.json({ order: formatOrderResponse(order) });
  } catch(err){
    console.error('updateOrder error', err);
    res.status(500).json({ error: 'Unable to update order' });
  }
}

async function linkCustomOrder(req, res){
  try{
    const { orderId, customOrderId } = req.body;
    if(!orderId || !customOrderId) return res.status(400).json({ error: 'orderId and customOrderId required' });
    const order = await Order.findByPk(orderId);
    const customOrder = await CustomOrder.findByPk(customOrderId);
    if(!order || !customOrder) return res.status(404).json({ error: 'Order or Custom order missing' });
    const changes = [];
    const customChange = collectFieldChange(order, 'customOrderId', customOrder.id);
    if(customChange) changes.push({ field: 'customOrderId', ...customChange });
    const typeChange = collectFieldChange(order, 'type', 'custom');
    if(typeChange) changes.push({ field: 'type', ...typeChange });
    const designerChange = collectFieldChange(order, 'designerId', customOrder.designerId);
    if(designerChange) changes.push({ field: 'designerId', ...designerChange });
    const totalChange = collectFieldChange(order, 'totalCents', customOrder.quoteCents || order.totalCents);
    if(totalChange) changes.push({ field: 'totalCents', ...totalChange });
    const currencyChange = collectFieldChange(order, 'currency', customOrder.currency || order.currency);
    if(currencyChange) changes.push({ field: 'currency', ...currencyChange });
    await saveOrderWithAudit(order, changes, req.user.id, 'Linked to custom commission');
    res.json({ order: formatOrderResponse(await order.reload({ include: ORDER_INCLUDE })) });
  }catch(err){
    console.error('linkCustomOrder error', err);
    res.status(500).json({ error: 'Unable to link custom order' });
  }
}

module.exports = { getCart, addToCart, removeFromCart, checkout, listOrders, getOrderById, updateOrder, linkCustomOrder };