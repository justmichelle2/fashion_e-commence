const { CustomOrder } = require('../models');
const { validate, schemas } = require('../utils/validators');
const { normalizeCurrency, BASE_CURRENCY } = require('../utils/currency');

async function createRequest(req, res){
  if(req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can create requests' });
  try{
    const parsed = validate(schemas.customOrderCreate, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const payload = parsed.data;
    const preferredCurrency = normalizeCurrency(req.user.preferredCurrency) || BASE_CURRENCY;
    const order = await CustomOrder.create({
      ...payload,
      inspirationImages: payload.inspirationImages || [],
      description: payload.description || payload.notes || '',
      customerId: req.user.id,
      currency: preferredCurrency,
    });
    res.json({ order });
  }catch(err){
    console.error('createRequest error', err);
    res.status(500).json({ error: 'Unable to create custom order' });
  }
}

async function listRequestsForUser(req, res){
  try{
    const user = req.user;
    let where = {};
    if(user.role === 'customer') where.customerId = user.id;
    if(user.role === 'designer') where.designerId = user.id;
    const orders = await CustomOrder.findAll({ where, order: [['updatedAt','DESC']] });
    res.json({ orders });
  }catch(err){
    console.error('listRequestsForUser error', err);
    res.status(500).json({ error: 'Unable to load custom orders' });
  }
}

async function respondToRequest(req, res){
  // designer accepts or rejects and sets quote
  if(req.user.role !== 'designer') return res.status(403).json({ error: 'Only designers can respond' });
  try{
    const parsed = validate(schemas.customOrderRespond, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const { action, quoteCents, estimatedDeliveryDays } = parsed.data;
    const order = await CustomOrder.findByPk(req.params.id);
    if(!order) return res.status(404).json({ error: 'Not found' });
    if(order.designerId && order.designerId !== req.user.id) return res.status(403).json({ error: 'Order already assigned' });
    if(action === 'accept'){
      order.status = 'quoted';
      order.quoteCents = quoteCents;
      order.estimatedDeliveryDays = estimatedDeliveryDays;
      order.designerId = req.user.id;
      await order.save();
      return res.json({ order });
    }
    order.status = 'rejected';
    order.designerId = req.user.id;
    await order.save();
    return res.json({ order });
  }catch(err){
    console.error('respondToRequest error', err);
    res.status(500).json({ error: 'Unable to respond to request' });
  }
}

async function updateStatus(req, res){
  try{
    const { id } = req.params;
    const parsed = validate(schemas.customOrderStatus, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const { status, progressStep, paymentStatus, trackingUrl } = parsed.data;
    const order = await CustomOrder.findByPk(id);
    if(!order) return res.status(404).json({ error: 'Not found' });
    if(req.user.id !== order.designerId && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    if(status) order.status = status;
    if(progressStep) order.progressStep = progressStep;
    if(paymentStatus) order.paymentStatus = paymentStatus;
    if(trackingUrl) order.trackingUrl = trackingUrl;
    await order.save();
    res.json({ order });
  }catch(err){
    console.error('updateStatus error', err);
    res.status(500).json({ error: 'Unable to update status' });
  }
}

async function attachAssets(req, res){
  try{
    const { id } = req.params;
    const parsed = validate(schemas.customOrderAssets, req.body);
    if(parsed.error) return res.status(400).json({ error: parsed.error });
    const order = await CustomOrder.findByPk(id);
    if(!order) return res.status(404).json({ error: 'Not found' });
    if(req.user.id !== order.customerId && req.user.id !== order.designerId) return res.status(403).json({ error: 'Forbidden' });
    order.inspirationImages = [...(order.inspirationImages || []), ...parsed.data.inspirationImages];
    await order.save();
    res.json({ order });
  }catch(err){
    console.error('attachAssets error', err);
    res.status(500).json({ error: 'Unable to attach assets' });
  }
}

module.exports = { createRequest, listRequestsForUser, respondToRequest, updateStatus, attachAssets };
