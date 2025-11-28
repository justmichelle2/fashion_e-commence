"use client"

import { Link } from '@/navigation'
import CustomOrderTimeline from './CustomOrderTimeline'
import { useLocale } from './LocaleProvider'
import { normalizeStatusKey, humanizeStatus } from './orderStatus'
import { useCurrency } from './CurrencyProvider'

const STATUS_COLOR = {
  requested: 'bg-amber-200/30 text-amber-200',
  quoted: 'bg-sky-200/30 text-sky-200',
  in_progress: 'bg-emerald-200/30 text-emerald-200',
  in_production: 'bg-indigo-200/30 text-indigo-200',
  delivered: 'bg-purple-200/30 text-purple-200',
  completed: 'bg-muted text-emerald-200',
  rejected: 'bg-rose-200/30 text-rose-200',
}

export default function CustomOrderCard({ order, role = 'customer' }) {
  const { t } = useLocale()
  const { format } = useCurrency()
  const statusClass = STATUS_COLOR[order.status] || 'bg-muted text-white'
  const statusKey = normalizeStatusKey(order.status)
  const statusLabel = statusKey
    ? t(`orders.status.${statusKey}`, humanizeStatus(order.status))
    : humanizeStatus(order.status)
  const paymentKey = normalizeStatusKey(order.paymentStatus)
  const paymentLabel = paymentKey
    ? t(`orders.status.${paymentKey}`, humanizeStatus(order.paymentStatus))
    : order.paymentStatus || t('orders.status.pending', 'Pending')
  const budgetValue = typeof order.quoteCents === 'number'
    ? format(order.quoteCents, { fromCurrency: order.currency || 'USD' })
    : t('orders.status.pending', 'Pending')

  return (
    <article className="card p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{t('orders.card.title', 'Custom order')}</p>
          <h3 className="text-2xl font-serif">{order.title}</h3>
        </div>
        <span className={`tag-chip ${statusClass}`}>{statusLabel}</span>
      </div>

      <p className="text-sm text-muted line-clamp-2">{order.description || t('orders.card.descriptionPlaceholder', 'Awaiting designer notes')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{t('orders.card.budget', 'Budget')}</p>
          <p className="text-lg font-serif">{budgetValue}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{t('orders.card.paymentStatus', 'Payment status')}</p>
          <p className="text-lg font-serif text-white">{paymentLabel}</p>
        </div>
      </div>

      <CustomOrderTimeline status={order.status} compact />

      <div className="flex flex-wrap gap-3">
        <Link href={`/custom-order/${order.id}`} className="btn-primary">
          {t('actions.viewWorkspace', 'View workspace')}
        </Link>
        <Link href={`/custom-order/${order.id}#chat`} className="btn-secondary">
          {t('actions.openChat', 'Open chat')}
        </Link>
        {role === 'designer' && order.status === 'requested' && (
          <span className="text-xs text-muted">{t('orders.card.designerReminder', 'New brief awaiting your quote.')}</span>
        )}
      </div>
    </article>
  )
}
