const { OrderAuditLog } = require('../models');

async function recordOrderAudit({ orderId, field, previousValue, newValue, changedBy, comment }) {
  if (!orderId || field === undefined) return null;
  const prev = previousValue ?? null;
  const next = newValue ?? null;
  if (JSON.stringify(prev) === JSON.stringify(next)) return null;
  return OrderAuditLog.create({
    orderId,
    field,
    previousValue: prev,
    newValue: next,
    changedBy: changedBy || null,
    comment: comment || null,
  });
}

module.exports = { recordOrderAudit };
