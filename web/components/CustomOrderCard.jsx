import Link from 'next/link'
import CustomOrderTimeline from './CustomOrderTimeline'

const STATUS_COLOR = {
  requested: 'bg-amber-200/30 text-amber-200',
  quoted: 'bg-sky-200/30 text-sky-200',
  in_progress: 'bg-emerald-200/30 text-emerald-200',
  in_production: 'bg-indigo-200/30 text-indigo-200',
  delivered: 'bg-purple-200/30 text-purple-200',
  completed: 'bg-muted text-emerald-200',
  rejected: 'bg-rose-200/30 text-rose-200',
}

const formatMoney = (value, currency = 'USD') => {
  if (typeof value !== 'number') return 'Pending'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100)
}

export default function CustomOrderCard({ order, role = 'customer' }) {
  const statusClass = STATUS_COLOR[order.status] || 'bg-muted text-white'

  return (
    <article className="card p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Custom order</p>
          <h3 className="text-2xl font-serif">{order.title}</h3>
        </div>
        <span className={`tag-chip ${statusClass}`}>{order.status.replace('_', ' ')}</span>
      </div>

      <p className="text-sm text-muted line-clamp-2">{order.description || 'Awaiting designer notes'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Budget</p>
          <p className="text-lg font-serif">{formatMoney(order.quoteCents, order.currency)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Payment status</p>
          <p className="text-lg font-serif text-white">{order.paymentStatus || 'pending'}</p>
        </div>
      </div>

      <CustomOrderTimeline status={order.status} compact />

      <div className="flex flex-wrap gap-3">
        <Link href={`/custom-order/${order.id}`} className="btn-primary">
          View workspace
        </Link>
        <Link href={`/custom-order/${order.id}#chat`} className="btn-secondary">
          Open chat
        </Link>
        {role === 'designer' && order.status === 'requested' && (
          <span className="text-xs text-muted">New brief awaiting your quote.</span>
        )}
      </div>
    </article>
  )
}
