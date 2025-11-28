import { useMemo } from 'react'
import Layout from '../../components/Layout'
import SectionHeader from '../../components/SectionHeader'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useLocale } from '../../components/LocaleProvider'
import { useCurrency } from '../../components/CurrencyProvider'

const FALLBACK_METRICS = ['activeCommissions', 'portfolioPieces', 'sales']

const ACTIVE_STATUSES = ['requested', 'quoted', 'in_progress']
const FITTING_STATUSES = ['quoted', 'in_progress', 'in_production']

const PAYOUT_ELIGIBLE_STATUSES = ['paid', 'in_production', 'waiting_for_review', 'shipped', 'delivered']

export default function DesignerDashboardPage() {
  const { t } = useLocale()
  const { format, convert, currency: activeCurrency } = useCurrency()
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

  const strings = useMemo(
    () => ({
      loading: t('pages.designerDashboard.loading', 'Loading designer workspace…'),
      pageEyebrow: t('pages.designerDashboard.eyebrow', 'Designer'),
      pageTitle: t('pages.designerDashboard.title', 'Dashboard'),
      pageDescription: t(
        'pages.designerDashboard.description',
        'Track commissions, upload templates, and manage payouts. Real data wires into /api/dashboard.',
      ),
      metricFallbacks: {
        activeCommissions: {
          label: t('pages.designerDashboard.metrics.active', 'Active commissions'),
          value: '3',
        },
        portfolioPieces: {
          label: t('pages.designerDashboard.metrics.portfolio', 'Portfolio pieces'),
          value: '18',
        },
        sales: {
          label: t('pages.designerDashboard.metrics.sales', 'Sales'),
          value: '12',
        },
      },
      summaryHint: {
        loading: t('pages.designerDashboard.summary.loading', 'Syncing live metrics…'),
        error: t(
          'pages.designerDashboard.summary.error',
          'Unable to refresh summary — showing cached numbers.',
        ),
      },
      pipelineHeader: {
        title: t('pages.designerDashboard.pipeline.title', 'Active pipeline'),
        subtitle: t('pages.designerDashboard.pipeline.subtitle', 'Concierge syncs status with clients'),
        loading: t('pages.designerDashboard.pipeline.loading', 'Loading commissions…'),
        empty: t(
          'pages.designerDashboard.pipeline.empty',
          "No active commissions yet. When concierge assigns briefs to you they'll appear here.",
        ),
        error: t('pages.designerDashboard.pipeline.error', 'Unable to refresh custom orders.'),
      },
      payouts: {
        title: t('pages.designerDashboard.payouts.title', 'Payouts'),
        subtitle: t('pages.designerDashboard.payouts.subtitle', 'Completed orders awaiting release'),
        pending: t('pages.designerDashboard.payouts.pending', 'Pending'),
        orders: t('pages.designerDashboard.payouts.orders', 'Orders'),
        currency: t('pages.designerDashboard.payouts.currency', 'Currency'),
        syncing: t('pages.designerDashboard.payouts.syncing', 'Syncing payout queue…'),
        error: t('pages.designerDashboard.payouts.error', 'Unable to refresh payouts right now.'),
      },
      fittings: {
        title: t('pages.designerDashboard.fittings.title', 'Upcoming fittings'),
        subtitle: t('pages.designerDashboard.fittings.subtitle', 'Coordinate with concierge'),
        empty: t('pages.designerDashboard.fittings.empty', 'No fittings scheduled yet.'),
        statusLabel: t('pages.designerDashboard.fittings.status', 'Status'),
        etaLabel: t('pages.designerDashboard.fittings.eta', 'ETA'),
        etaFallback: t('pages.designerDashboard.fittings.etaFallback', 'TBD'),
      },
      templates: {
        title: t('pages.designerDashboard.templates.title', 'Templates'),
        subtitle: t('pages.designerDashboard.templates.subtitle', 'Speed up briefs with reusable looks'),
        upload: t('pages.designerDashboard.templates.upload', 'Upload template'),
        assets: t('pages.designerDashboard.templates.assets', 'Manage assets'),
        share: t('pages.designerDashboard.templates.share', 'Share lookbook'),
      },
    }),
    [t],
  )

  const metricCards = summaryData?.cards?.length
    ? summaryData.cards
    : FALLBACK_METRICS.map((key) => strings.metricFallbacks[key])
  const pipeline = (ordersData?.orders || []).filter((order) => ACTIVE_STATUSES.includes(order.status))
  const fittings = (ordersData?.orders || []).filter((order) => FITTING_STATUSES.includes(order.status)).slice(0, 4)
  const payoutOrders = (payoutsData?.orders || []).filter((order) => PAYOUT_ELIGIBLE_STATUSES.includes(order.status))
  const payoutDue = payoutOrders.reduce(
    (sum, order) =>
      sum +
      convert(order.totalCents || 0, {
        from: order.currency || 'USD',
        to: activeCurrency,
      }),
    0,
  )

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">{strings.loading}</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">{strings.pageEyebrow}</p>
        <h1 className="text-4xl font-serif">{strings.pageTitle}</h1>
        <p className="text-muted mt-2">{strings.pageDescription}</p>
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
        <p className="text-xs text-muted mb-8">{summaryLoading ? strings.summaryHint.loading : strings.summaryHint.error}</p>
      )}

      <section className="mb-10">
        <SectionHeader title={strings.pipelineHeader.title} subtitle={strings.pipelineHeader.subtitle} />
        <div className="space-y-4">
          {ordersLoading && <p className="text-muted">{strings.pipelineHeader.loading}</p>}
          {!ordersLoading && pipeline.length === 0 && (
            <article className="card p-6 text-sm text-muted">{strings.pipelineHeader.empty}</article>
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
          {ordersError && <p className="text-xs text-rose-300">{strings.pipelineHeader.error}</p>}
        </div>
      </section>

      <section className="surface-glass p-6 rounded-2xl">
        <SectionHeader title={strings.payouts.title} subtitle={strings.payouts.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{strings.payouts.pending}</p>
            <p className="text-2xl font-serif">{format(payoutDue, { skipConversion: true })}</p>
          </article>
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{strings.payouts.orders}</p>
            <p className="text-2xl font-serif">{payoutOrders.length}</p>
          </article>
          <article className="surface-glass/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{strings.payouts.currency}</p>
            <p className="text-2xl font-serif">{payoutOrders[0]?.currency || 'USD'}</p>
          </article>
        </div>
        {(payoutsLoading || payoutsError) && (
          <p className="text-xs text-muted mb-4">
            {payoutsLoading ? strings.payouts.syncing : strings.payouts.error}
          </p>
        )}
        <SectionHeader title={strings.fittings.title} subtitle={strings.fittings.subtitle} />
        <div className="space-y-3 mt-4">
          {fittings.length === 0 && <p className="text-sm text-muted">{strings.fittings.empty}</p>}
          {fittings.map((order) => (
            <article key={order.id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{order.customerName || order.customerId}</p>
                <h3 className="text-lg font-serif">{order.title}</h3>
                <p className="text-xs text-muted">
                  {strings.fittings.statusLabel}: {order.status}
                </p>
              </div>
              <span className="tag-chip">
                {strings.fittings.etaLabel}{' '}
                {order.estimatedDeliveryDays ? `${order.estimatedDeliveryDays}d` : strings.fittings.etaFallback}
              </span>
            </article>
          ))}
        </div>
        <SectionHeader title={strings.templates.title} subtitle={strings.templates.subtitle} />
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="btn-secondary">{strings.templates.upload}</button>
          <button className="btn-secondary">{strings.templates.assets}</button>
          <button className="btn-secondary">{strings.templates.share}</button>
        </div>
      </section>
    </Layout>
  )
}
