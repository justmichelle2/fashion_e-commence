'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import FilterChip from '../ui/FilterChip'
import { useSession } from '../../../components/SessionProvider'
import { useAuthedSWR } from '../../../hooks/useAuthedSWR'
import { formatMoney } from '../../lib/price'

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

function formatDate(value) {
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

function summarizeItems(items = []) {
  if (!items.length) return 'No line items attached.'
  return items
    .map((item) => `${item.title || 'Item'} ×${item.quantity || 1}`)
    .slice(0, 3)
    .join(', ')
}

export default function AdminOrdersClient() {
  const router = useRouter()
  const { status, user, token } = useSession()
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }))
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [auditPage, setAuditPage] = useState(1)

  const isAdmin = status === 'authenticated' && user?.role === 'admin'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/account/login?redirect=${encodeURIComponent('/admin/orders')}`)
    } else if (status === 'authenticated' && !isAdmin) {
      router.replace('/')
    }
  }, [status, isAdmin, router])

  const ordersQuery = useMemo(() => {
    const params = new URLSearchParams({ limit: PER_PAGE.toString(), page: filters.page.toString() })
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.customer) params.set('customer', filters.customer)
    if (filters.designer) params.set('designer', filters.designer)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    return `/api/admin/orders?${params.toString()}`
  }, [filters])

  const ordersResult = useAuthedSWR(isAdmin ? ordersQuery : null, { enabled: isAdmin })
  const orders = useMemo(() => ordersResult.data?.orders || [], [ordersResult.data?.orders])
  const summary = useMemo(() => {
    const payload = ordersResult.data?.summary
    if (payload) return payload
    return {
      escalations: orders.filter((order) => ['cancelled', 'refunded', 'dispute_opened'].includes(order.status)).length,
      pending: orders.filter((order) => order.status === 'pending_payment').length,
      inProduction: orders.filter((order) => order.status === 'in_production').length,
    }
  }, [ordersResult.data?.summary, orders])

  useEffect(() => {
    setAuditPage(1)
  }, [expandedOrderId])

  const auditQuery = useMemo(() => {
    if (!expandedOrderId) return null
    const params = new URLSearchParams({ limit: AUDIT_PAGE_SIZE.toString(), page: auditPage.toString() })
    return `/api/admin/orders/${expandedOrderId}/audit?${params.toString()}`
  }, [expandedOrderId, auditPage])

  const auditResult = useAuthedSWR(expandedOrderId && isAdmin ? auditQuery : null, {
    enabled: Boolean(expandedOrderId && isAdmin),
  })

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
      await ordersResult.mutate()
      if (orderId === expandedOrderId && auditResult.mutate) await auditResult.mutate()
      setFeedback({ type: 'success', text: 'Order updated' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }))
  }

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS })

  const goToPage = (direction) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page + direction) }))
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <Container className="py-24 text-center text-muted">
        Loading admin workspace…
      </Container>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-10 pb-16">
      <Container className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Order escalations</h1>
        <p className="text-muted">
          Track payment issues, cancellations, and fulfillment steps from one control room.
        </p>
      </Container>

      {feedback && (
        <Container>
          <Card className={`text-sm ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>
            {feedback.text}
          </Card>
        </Container>
      )}

      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {[{ label: 'Escalations', value: summary?.escalations ?? 0 }, { label: 'Pending', value: summary?.pending ?? 0 }, { label: 'In production', value: summary?.inProduction ?? 0 }].map((metric) => (
            <Card key={metric.label} className="p-5 text-center">
              <p className="text-3xl font-serif">{metric.value}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-muted mt-2">{metric.label}</p>
            </Card>
          ))}
        </div>
      </Container>

      <Container>
        <Card className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
              Status
              <select className="form-select" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
              Customer
              <input className="form-input" placeholder="Search" value={filters.customer} onChange={(event) => handleFilterChange('customer', event.target.value)} />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
              Designer
              <input className="form-input" placeholder="Search" value={filters.designer} onChange={(event) => handleFilterChange('designer', event.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
                From
                <input type="date" className="form-input" value={filters.from} onChange={(event) => handleFilterChange('from', event.target.value)} />
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-muted flex flex-col gap-2">
                To
                <input type="date" className="form-input" value={filters.to} onChange={(event) => handleFilterChange('to', event.target.value)} />
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        </Card>
      </Container>

      <Container>
        <Card className="space-y-4">
          {ordersResult.isLoading && <p className="text-sm text-muted">Syncing orders…</p>}
          {!ordersResult.isLoading && orders.length === 0 && <p className="text-sm text-muted">No orders match this filter.</p>}

          <div className="divide-y divide-white/5">
            {orders.map((order) => {
              const actions = ACTIONS_BY_STATUS[order.status] || []
              const expanded = expandedOrderId === order.id
              return (
                <article key={order.id} className="py-6 space-y-4">
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

                  <div className="grid gap-4 md:grid-cols-3 text-sm">
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
                    <p className="text-xs text-muted">
                      Linked brief: <Link href={`/custom-order/${order.customOrder?.id || order.customOrderId}`}>View conversation →</Link>
                    </p>
                  )}

                  {order.notes && <p className="text-xs text-muted">Notes: {order.notes}</p>}

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Actions</p>
                    {actions.length === 0 && <p className="text-xs text-muted">No actions available.</p>}
                    {actions.map((action) => (
                      <Button key={action.label} variant="secondary" size="sm" disabled={busyId === order.id} onClick={() => handleStatusChange(order.id, action.nextStatus)}>
                        {busyId === order.id ? 'Updating…' : action.label}
                      </Button>
                    ))}
                    <label className="text-xs uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                      Set status
                      <select className="form-select" value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)} disabled={busyId === order.id}>
                        {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedOrderId(expanded ? null : order.id)}>
                      {expanded ? 'Hide audit' : 'Show audit'}
                    </Button>
                  </div>

                  {expanded && (
                    <div className="rounded-2xl border border-white/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted">Audit log</p>
                        <div className="flex items-center gap-2">
                          <FilterChip active={auditPage === 1} onClick={() => setAuditPage(Math.max(1, auditPage - 1))}>
                            Prev
                          </FilterChip>
                          <FilterChip onClick={() => setAuditPage(auditPage + 1)}>Next</FilterChip>
                        </div>
                      </div>
                      {auditResult.isLoading && <p className="text-xs text-muted">Loading audit…</p>}
                      {auditResult.error && <p className="text-xs text-rose-300">Unable to load audit log.</p>}
                      <ul className="space-y-2 text-sm">
                        {(auditResult.data?.logs || []).map((log) => (
                          <li key={log.id} className="border-b border-white/5 pb-2">
                            <p className="text-xs text-muted">{formatDate(log.createdAt)}</p>
                            <p>{log.message || log.action}</p>
                          </li>
                        ))}
                        {!auditResult.isLoading && (auditResult.data?.logs || []).length === 0 && (
                          <li className="text-xs text-muted">No audit events.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs uppercase tracking-[0.2em] text-muted">
            <Button variant="secondary" size="sm" onClick={() => goToPage(-1)} disabled={filters.page === 1}>
              Prev
            </Button>
            <span>Page {filters.page}</span>
            <Button variant="secondary" size="sm" onClick={() => goToPage(1)} disabled={orders.length < PER_PAGE}>
              Next
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  )
}
