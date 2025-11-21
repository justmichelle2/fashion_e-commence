export const TIMELINE_SEQUENCE = ['requested', 'quoted', 'in_progress', 'in_production', 'delivered', 'completed']

const STATUS_KEY_MAP = {
  requested: 'requested',
  quoted: 'quoted',
  in_progress: 'inProgress',
  inprogress: 'inProgress',
  in_production: 'inProduction',
  inproduction: 'inProduction',
  delivered: 'delivered',
  completed: 'completed',
  rejected: 'rejected',
  pending: 'pending',
}

export function normalizeStatusKey(status = '') {
  if (!status) return ''
  const key = String(status).replace(/-/g, '_').toLowerCase()
  return STATUS_KEY_MAP[key] || key
}

export function humanizeStatus(status = '') {
  if (!status) return ''
  return String(status)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
