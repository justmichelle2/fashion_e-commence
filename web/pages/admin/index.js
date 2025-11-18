import Link from 'next/link'
import Layout from '../../components/Layout'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'

const PANELS = [
  { title: 'Users', description: 'Approve designers, review KYC, and manage roles.', action: 'Review queue', href: '/admin/users' },
  { title: 'Orders', description: 'Monitor escalations and refunds across regions.', action: 'View orders', href: '/admin/orders' },
  { title: 'Editorial', description: 'Publish stories and home page capsules.', action: 'Open CMS', href: '/admin' },
]

export default function AdminDashboardPage() {
  const { status, isAuthorized } = useRequireAuth({ roles: ['admin'] })
  const { data, isLoading, error } = useAuthedSWR('/api/dashboard/summary', { enabled: isAuthorized })
  const { data: customOrdersData, isLoading: customLoading, error: customError } = useAuthedSWR('/api/custom-orders', {
    enabled: isAuthorized,
  })
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useAuthedSWR('/api/orders', {
    enabled: isAuthorized,
  })
  const cards = data?.cards || []
  const briefsQueue = (customOrdersData?.orders || []).filter((order) => ['requested', 'quoted'].includes(order.status)).slice(0, 5)
  const escalations = (ordersData?.orders || [])
    .filter((order) => ['pending_payment', 'cancelled', 'refunded', 'dispute_opened'].includes(order.status))
    .slice(0, 5)

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Checking admin access…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Control center</h1>
        <p className="text-muted mt-2">Secure area for membership approvals, orders, and content. Wire this to `/api/admin` endpoints.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <article key={card.label} className="surface-glass p-5 rounded-2xl text-center">
            <p className="text-3xl font-serif">{card.value}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mt-2">{card.label}</p>
          </article>
        ))}
        {cards.length === 0 && (
          <article className="surface-glass p-5 rounded-2xl text-sm text-muted col-span-full">
            Live metrics will appear once the API responds.
          </article>
        )}
      </div>
      {(isLoading || error) && (
        <p className="text-xs text-muted mb-6">
          {isLoading ? 'Syncing summary…' : 'Unable to refresh summary — showing defaults.'}
        </p>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <article className="surface-glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Designer queue</p>
              <h2 className="text-2xl font-serif">Custom briefs</h2>
            </div>
            <Link href="/admin/users" className="btn-secondary">
              Manage designers
            </Link>
          </div>
          {(customLoading || customError) && (
            <p className="text-xs text-muted mb-4">
              {customLoading ? 'Checking briefs…' : 'Unable to load briefs.'}
            </p>
          )}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {briefsQueue.length === 0 && <p className="text-sm text-muted">No briefs need action.</p>}
            {briefsQueue.map((order) => (
              <article key={order.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">{order.status}</p>
                  <p className="text-lg font-serif">{order.title}</p>
                </div>
                <Link href={`/custom-order/${order.id}`} className="btn-secondary">
                  Review
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Escalations</p>
              <h2 className="text-2xl font-serif">Orders needing attention</h2>
            </div>
            <Link href="/admin/orders" className="btn-secondary">
              View all
            </Link>
          </div>
          {(ordersLoading || ordersError) && (
            <p className="text-xs text-muted mb-4">
              {ordersLoading ? 'Loading escalations…' : 'Unable to load orders.'}
            </p>
          )}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {escalations.length === 0 && <p className="text-sm text-muted">No escalations right now.</p>}
            {escalations.map((order) => (
              <article key={order.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{order.status}</p>
                    <p className="text-lg font-serif">{order.type === 'custom' ? 'Custom commission' : 'Catalog order'}</p>
                  </div>
                  <span className="tag-chip">{order.currency || 'USD'}</span>
                </div>
                <p className="text-xs text-muted mt-2">
                  Total {order.totalCents ? `$${(order.totalCents / 100).toFixed(0)}` : 'TBD'} · Updated{' '}
                  {new Date(order.updatedAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PANELS.map((panel) => (
          <article key={panel.title} className="card p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{panel.title}</p>
            <h2 className="text-2xl font-serif">{panel.description}</h2>
            <Link href={panel.href} className="btn-secondary w-full text-center">
              {panel.action}
            </Link>
          </article>
        ))}
      </div>
    </Layout>
  )
}
