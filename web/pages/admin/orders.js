import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useSession } from '../../components/SessionProvider'

const PER_PAGE = 20
const AUDIT_PAGE_SIZE = 10
const DEFAULT_FILTERS = { status: 'all', customer: '', designer: '', from: '', to: '', page: 1 }

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending_payment', label: 'Pending payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'in_production', label: 'In production' },
  { value: 'waiting_for_review', label: 'Waiting for review' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'dispute_opened', label: 'Dispute opened' },
]

const STATUS_LABELS = {
  cart: 'Cart',
  pending_payment: 'Pending payment',
  paid: 'Paid',
  in_production: 'In production',
  waiting_for_review: 'Waiting for review',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  dispute_opened: 'Dispute opened',
}

const ACTIONS_BY_STATUS = {
  pending_payment: [
    { label: 'Mark paid', nextStatus: 'paid' },
    { label: 'Cancel order', nextStatus: 'cancelled' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  paid: [
    { label: 'Start production', nextStatus: 'in_production' },
    { label: 'Issue refund', nextStatus: 'refunded' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  in_production: [
    { label: 'Awaiting review', nextStatus: 'waiting_for_review' },
    { label: 'Cancel order', nextStatus: 'cancelled' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  waiting_for_review: [
    { label: 'Mark shipped', nextStatus: 'shipped' },
    { label: 'Issue refund', nextStatus: 'refunded' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  shipped: [
    { label: 'Mark delivered', nextStatus: 'delivered' },
    { label: 'Issue refund', nextStatus: 'refunded' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  delivered: [
    { label: 'Issue refund', nextStatus: 'refunded' },
    { label: 'Open dispute', nextStatus: 'dispute_opened' },
  ],
  dispute_opened: [
    { label: 'Resume production', nextStatus: 'in_production' },
    { label: 'Issue refund', nextStatus: 'refunded' },
  ],
  cancelled: [{ label: 'Reopen order', nextStatus: 'pending_payment' }],
  refunded: [],
}

const formatMoney = (value, currency = 'USD') => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100)
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (err) {
    return value
  }
}

const summarizeItems = (items = []) => {
  if (!items.length) return 'No line items attached.'
  return items
    .map((item) => `${item.title || 'Item'} ×${item.quantity || 1}`)
    .slice(0, 3)
    .join(', ')
}

const formatAddress = (value) => {
  if (!value) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const parts = Object.values(value).filter(Boolean)
    if (parts.length) return parts.join(', ')
  }
  try {
    return JSON.stringify(value)
  } catch (err) {
    return String(value)
  }
}

const formatAuditValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (err) {
      return '[object]'
    }
  }
  return String(value)
}

export default function AdminOrdersPage() {
  const { status, isAuthorized } = useRequireAuth({ roles: ['admin'] })
  const { token } = useSession()
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }))
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [auditPage, setAuditPage] = useState(1)

  const ordersQuery = useMemo(() => {
    const params = new URLSearchParams({ limit: PER_PAGE.toString(), page: filters.page.toString() })
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.customer) params.set('customer', filters.customer)
    if (filters.designer) params.set('designer', filters.designer)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    return `/api/admin/orders?${params.toString()}`
  }, [filters])

  const { data, isLoading, error, mutate } = useAuthedSWR(isAuthorized ? ordersQuery : null, { enabled: isAuthorized })
  const ordersSource = data?.orders
  const orders = useMemo(() => (Array.isArray(ordersSource) ? ordersSource : []), [ordersSource])
  const pagination = data?.pagination
  const summaryPayload = data?.summary
  const summary = useMemo(() => {
    if (summaryPayload) return summaryPayload
    return {
      escalations: orders.filter((order) => ['cancelled', 'refunded', 'dispute_opened'].includes(order.status)).length,
      pending: orders.filter((order) => order.status === 'pending_payment').length,
      inProduction: orders.filter((order) => order.status === 'in_production').length,
    }
  }, [orders, summaryPayload])

  useEffect(() => {
    setAuditPage(1)
  }, [expandedOrderId])

  const auditQuery = useMemo(() => {
    if (!expandedOrderId) return null
    const params = new URLSearchParams({ limit: AUDIT_PAGE_SIZE.toString(), page: auditPage.toString() })
    return `/api/admin/orders/${expandedOrderId}/audit?${params.toString()}`
  }, [expandedOrderId, auditPage])

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
    mutate: auditMutate,
  } = useAuthedSWR(expandedOrderId && isAuthorized ? auditQuery : null, { enabled: Boolean(expandedOrderId && isAuthorized) })

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!token) return
    const comment = typeof window !== 'undefined' ? window.prompt('Add internal note (optional)', '') : ''
    setBusyId(orderId)
    setFeedback(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus, comment }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Unable to update order')
      }
      await mutate()
      if (orderId === expandedOrderId && auditMutate) await auditMutate()
      setFeedback({ type: 'success', text: 'Order updated' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const handleStatusSelect = (orderId, currentStatus) => (event) => {
    const nextStatus = event.target.value
    if (nextStatus === currentStatus) return
    handleStatusChange(orderId, nextStatus)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }))
  }

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS })

  const goToPage = (direction) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page + direction) }))
  }

  const auditLogs = auditData?.logs || []
  const auditPagination = auditData?.pagination

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading admin workspace…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Order escalations</h1>
        <p className="text-muted mt-2">Track payment issues, cancellations, and fulfillment steps from one control room.</p>
      </section>

      {feedback && (
        <p className={`text-sm mb-4 ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>{feedback.text}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Escalations', value: summary?.escalations ?? 0 },
          { label: 'Pending', value: summary?.pending ?? 0 },
          { label: 'In production', value: summary?.inProduction ?? 0 },
        ].map((metric) => (
          <article key={metric.label} className="surface-glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-serif">{metric.value}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mt-2">{metric.label}</p>
          </article>
        ))}
      </div>

      <section className="surface-glass rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
            Status
            <select
              className="form-select"
              value={filters.status}
              onChange={(event) => handleFilterChange('status', event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
            Customer
            <input
              className="form-input"
              placeholder="Search name"
              value={filters.customer}
              onChange={(event) => handleFilterChange('customer', event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
            Designer
            <input
              className="form-input"
              placeholder="Search name"
              value={filters.designer}
              onChange={(event) => handleFilterChange('designer', event.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
              From
              <input
                type="date"
                className="form-input"
                value={filters.from}
                onChange={(event) => handleFilterChange('from', event.target.value)}
              />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
              To
              <input
                type="date"
                className="form-input"
                value={filters.to}
                onChange={(event) => handleFilterChange('to', event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn-secondary" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      <section className="surface-glass rounded-2xl p-6">
        {isLoading && <p className="text-sm text-muted">Syncing orders…</p>}
        {!isLoading && orders.length === 0 && <p className="text-sm text-muted">No orders match this filter.</p>}
        <div className="divide-y divide-white/5">
          {orders.map((order) => {
            const actions = ACTIONS_BY_STATUS[order.status] || []
            const expanded = expandedOrderId === order.id
            return (
              <article key={order.id} className="py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">#{order.id?.slice(0, 8)}</p>
                    <h2 className="text-2xl font-serif">
                      {order.type === 'custom' ? 'Custom commission' : 'Catalog order'}
                    </h2>
                    <p className="text-xs text-muted">Updated {formatDate(order.updatedAt)}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="tag-chip inline-flex justify-end">{STATUS_LABELS[order.status] || order.status}</span>
                    <p className="text-xl font-serif">{formatMoney(order.totalCents, order.currency)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Customer</p>
                    <p className="font-medium">{order.customerName || order.customer?.name || order.customerId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Designer</p>
                    <p className="font-medium">{order.designerName || order.designer?.name || order.designerId || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Line items</p>
                    <p>{summarizeItems(order.items)}</p>
                  </div>
                </div>

                {order.customOrderId && (
                  <p className="text-xs text-muted mt-3">
                    Linked brief:{' '}
                    <Link href={`/custom-order/${order.customOrder?.id || order.customOrderId}`}>View conversation →</Link>
                  </p>
                )}

                {order.notes && <p className="text-xs text-muted mt-3">Notes: {order.notes}</p>}

                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Actions</div>
                  {actions.length === 0 && <p className="text-xs text-muted">No actions available.</p>}
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      className="btn-secondary"
                      disabled={busyId === order.id}
                      onClick={() => handleStatusChange(order.id, action.nextStatus)}
                    >
                      {busyId === order.id ? 'Updating…' : action.label}
                    </button>
                  ))}
                  <label className="text-xs uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    Set status
                    <select
                      className="form-select"
                      value={order.status}
                      onChange={handleStatusSelect(order.id, order.status)}
                      disabled={busyId === order.id}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="btn-secondary"
                    onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                  >
                    {expanded ? 'Hide details' : 'Details & audit trail'}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Shipping</p>
                        <p>{formatAddress(order.shippingAddress)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Payment method</p>
                        <p>{order.paymentMethod || 'Not set'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Audit history</p>
                        {auditPagination && (
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              className="btn-secondary"
                              disabled={auditPage === 1}
                              onClick={() => setAuditPage((value) => Math.max(1, value - 1))}
                            >
                              Prev
                            </button>
                            <span>
                              Page {auditPagination.page} / {auditPagination.pages || 1}
                            </span>
                            <button
                              className="btn-secondary"
                              disabled={auditPagination.page >= auditPagination.pages}
                              onClick={() => setAuditPage((value) => value + 1)}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                      {auditLoading && <p className="text-xs text-muted">Loading audit trail…</p>}
                      {auditError && <p className="text-xs text-rose-300">Unable to load audit logs.</p>}
                      {!auditLoading && auditLogs.length === 0 && (
                        <p className="text-xs text-muted">No audit entries yet.</p>
                      )}
                      {!auditLoading && auditLogs.length > 0 && (
                        <ul className="space-y-2 text-xs">
                          {auditLogs.map((log) => (
                            <li key={log.id} className="surface-glass/40 p-3 rounded-xl">
                              <div className="flex justify-between">
                                <span className="font-medium">{log.field}</span>
                                <span className="text-muted">{formatDate(log.createdAt)}</span>
                              </div>
                              <p className="mt-1">
                                <span className="text-muted">{formatAuditValue(log.previousValue)} →</span>{' '}
                                <span className="font-semibold">{formatAuditValue(log.newValue)}</span>
                              </p>
                              {log.actor && <p className="text-muted mt-1">By {log.actor.name || log.actor.email}</p>}
                              {log.comment && <p className="mt-1">Comment: {log.comment}</p>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
        {error && <p className="text-xs text-rose-300 mt-4">Unable to load orders.</p>}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <button className="btn-secondary" disabled={filters.page === 1} onClick={() => goToPage(-1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              className="btn-secondary"
              disabled={pagination.page >= pagination.pages}
              onClick={() => goToPage(1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </Layout>
  )
}
