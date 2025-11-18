const ORDER_STATUSES = [
  'cart',
  'pending_payment',
  'paid',
  'in_production',
  'waiting_for_review',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'dispute_opened',
];

const STATUS_TRANSITIONS = {
  cart: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'cancelled', 'refunded', 'dispute_opened'],
  paid: ['in_production', 'cancelled', 'refunded', 'dispute_opened'],
  in_production: ['waiting_for_review', 'cancelled', 'dispute_opened'],
  waiting_for_review: ['shipped', 'refunded', 'dispute_opened'],
  shipped: ['delivered', 'refunded', 'dispute_opened'],
  delivered: ['refunded', 'dispute_opened'],
  cancelled: ['pending_payment'],
  refunded: [],
  dispute_opened: ['refunded', 'in_production', 'waiting_for_review', 'shipped', 'delivered'],
};

function canTransition(fromStatus, toStatus) {
  if (!fromStatus || !toStatus) return false;
  if (fromStatus === toStatus) return true;
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function formatOrderResponse(orderInstance) {
  if (!orderInstance) return null;
  const order = orderInstance.toJSON();
  return {
    ...order,
    customerName: order.customer?.name || null,
    designerName: order.designer?.name || null,
  };
}

module.exports = { ORDER_STATUSES, STATUS_TRANSITIONS, canTransition, formatOrderResponse };
