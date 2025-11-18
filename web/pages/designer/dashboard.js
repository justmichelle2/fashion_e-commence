import Layout from '../../components/Layout'
import SectionHeader from '../../components/SectionHeader'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'

const FALLBACK_METRICS = [
  { label: 'Active commissions', value: '3' },
  { label: 'Portfolio pieces', value: '18' },
  { label: 'Sales', value: '12' },
]

const ACTIVE_STATUSES = ['requested', 'quoted', 'in_progress']
const FITTING_STATUSES = ['quoted', 'in_progress', 'in_production']

const PAYOUT_ELIGIBLE_STATUSES = ['paid', 'in_production', 'waiting_for_review', 'shipped', 'delivered']

const formatMoney = (value, currency = 'USD') => {
  if (typeof value !== 'number') return 'Pending'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100)
}

export default function DesignerDashboardPage() {
  const { status, isAuthorized } = useRequireAuth({ roles: ['designer'] })
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useAuthedSWR('/api/dashboard/summary', {
    enabled: isAuthorized,
  })
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useAuthedSWR('/api/custom-orders', {
    enabled: isAuthorized,
  })
  const { data: payoutsData, isLoading: payoutsLoading, error: payoutsError } = useAuthedSWR('/api/orders', {
    enabled: isAuthorized,
  })

  const metricCards = summaryData?.cards?.length ? summaryData.cards : FALLBACK_METRICS
  const pipeline = (ordersData?.orders || []).filter((order) => ACTIVE_STATUSES.includes(order.status))
  const fittings = (ordersData?.orders || []).filter((order) => FITTING_STATUSES.includes(order.status)).slice(0, 4)
  const payoutOrders = (payoutsData?.orders || []).filter((order) => PAYOUT_ELIGIBLE_STATUSES.includes(order.status))
  const payoutDue = payoutOrders.reduce((sum, order) => sum + (order.totalCents || 0), 0)

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading designer workspace…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Designer</p>
        <h1 className="text-4xl font-serif">Dashboard</h1>
        <p className="text-muted mt-2">Track commissions, upload templates, and manage payouts. Real data wires into `/api/dashboard`.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {metricCards.map((metric) => (
          <article key={metric.label} className="surface-glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-serif">{metric.value}</p>
            <p className="text-xs tracking-[0.25em] uppercase text-muted mt-2">{metric.label}</p>
          </article>
        ))}
      </div>
      {(summaryLoading || summaryError) && (
        <p className="text-xs text-muted mb-8">
          {summaryLoading ? 'Syncing live metrics…' : 'Unable to refresh summary — showing cached numbers.'}
        </p>
      )}

      <section className="mb-10">
        <SectionHeader title="Active pipeline" subtitle="Concierge syncs status with clients" />
        <div className="space-y-4">
          {ordersLoading && <p className="text-muted">Loading commissions…</p>}
          {!ordersLoading && pipeline.length === 0 && (
            <article className="card p-6 text-sm text-muted">No active commissions yet. When concierge assigns briefs to you they&apos;ll appear here.</article>
          )}
          {pipeline.map((order) => (
            <article key={order.id} className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{order.clientName || order.customerId}</p>
                <h3 className="text-2xl font-serif">{order.title}</h3>
              </div>
              <span className="tag-chip">{order.status}</span>
            </article>
          ))}
          {ordersError && <p className="text-xs text-rose-300">Unable to refresh custom orders.</p>}
        </div>
      </section>

      <section className="surface-glass p-6 rounded-2xl">
        <SectionHeader title="Payouts" subtitle="Completed orders awaiting release" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Pending</p>
            <p className="text-2xl font-serif">{formatMoney(payoutDue)}</p>
          </article>
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Orders</p>
            <p className="text-2xl font-serif">{payoutOrders.length}</p>
          </article>
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Currency</p>
            <p className="text-2xl font-serif">{payoutOrders[0]?.currency || 'USD'}</p>
          </article>
        </div>
        {(payoutsLoading || payoutsError) && (
          <p className="text-xs text-muted mb-4">
            {payoutsLoading ? 'Syncing payout queue…' : 'Unable to refresh payouts right now.'}
          </p>
        )}
        <SectionHeader title="Upcoming fittings" subtitle="Coordinate with concierge" />
        <div className="space-y-3 mt-4">
          {fittings.length === 0 && <p className="text-sm text-muted">No fittings scheduled yet.</p>}
          {fittings.map((order) => (
            <article key={order.id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{order.customerName || order.customerId}</p>
                <h3 className="text-lg font-serif">{order.title}</h3>
                <p className="text-xs text-muted">Status: {order.status}</p>
              </div>
              <span className="tag-chip">ETA {order.estimatedDeliveryDays ? `${order.estimatedDeliveryDays}d` : 'TBD'}</span>
            </article>
          ))}
        </div>
        <SectionHeader title="Templates" subtitle="Speed up briefs with reusable looks" />
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="btn-secondary">Upload template</button>
          <button className="btn-secondary">Manage assets</button>
          <button className="btn-secondary">Share lookbook</button>
        </div>
      </section>
    </Layout>
  )
}
