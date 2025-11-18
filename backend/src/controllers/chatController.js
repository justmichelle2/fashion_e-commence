const { ChatMessage, CustomOrder, User } = require('../models');

async function listMessages(req, res){
  const { customOrderId } = req.params;
  const order = await CustomOrder.findByPk(customOrderId);
  if(!order) return res.status(404).json({ error: 'Custom order not found' });
  if(order.customerId !== req.user.id && order.designerId !== req.user.id && req.user.role !== 'admin'){
    return res.status(403).json({ error: 'Forbidden' });
  }
  const messages = await ChatMessage.findAll({ where: { customOrderId }, order: [['createdAt','ASC']] });
  res.json({ messages });
}

async function sendMessage(req, res){
  const { customOrderId } = req.params;
  const { message, attachmentUrls = [] } = req.body;
  if(!message) return res.status(400).json({ error: 'message required' });
  const order = await CustomOrder.findByPk(customOrderId);
  if(!order) return res.status(404).json({ error: 'Custom order not found' });
  if(order.customerId !== req.user.id && order.designerId !== req.user.id && req.user.role !== 'admin'){
    return res.status(403).json({ error: 'Forbidden' });
  }
  const msg = await ChatMessage.create({ customOrderId, senderId: req.user.id, message, attachmentUrls });
  res.json({ message: msg });
}

module.exports = { listMessages, sendMessage };