const { Order, CustomOrder, User, Product } = require('../models');
const { Op } = require('sequelize');

async function summary(req, res){
  const role = req.user.role;
  const response = { role };

  if(role === 'admin'){
    const [users, designers, orders, customOrders] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'designer' } }),
      Order.count({ where: { status: { [Op.ne]: 'cart' } } }),
      CustomOrder.count()
    ]);
    response.cards = [
      { label: 'Total Users', value: users },
      { label: 'Designers', value: designers },
      { label: 'Orders', value: orders },
      { label: 'Custom Orders', value: customOrders }
    ];
  }else if(role === 'designer'){
    const [incomingCustoms, portfolio, sales] = await Promise.all([
      CustomOrder.count({ where: { designerId: req.user.id, status: { [Op.in]: ['requested','quoted','in_progress'] } } }),
      Product.count({ where: { designerId: req.user.id } }),
      Order.count({ where: { designerId: req.user.id, status: { [Op.ne]: 'cart' } } })
    ]);
    response.cards = [
      { label: 'Active Commissions', value: incomingCustoms },
      { label: 'Portfolio pieces', value: portfolio },
      { label: 'Sales', value: sales }
    ];
  }else{
    const [orders, wishlist, customs] = await Promise.all([
      Order.count({ where: { customerId: req.user.id, status: { [Op.ne]: 'cart' } } }),
      Product.count({ where: { category: { [Op.ne]: null } } }),
      CustomOrder.count({ where: { customerId: req.user.id } })
    ]);
    response.cards = [
      { label: 'Orders', value: orders },
      { label: 'Wishlist ideas', value: wishlist },
      { label: 'Custom Projects', value: customs }
    ];
  }

  res.json(response);
}

module.exports = { summary };