"use client"

import { Link } from '@/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '../ui/Container'
import AutoGrid from '../ui/AutoGrid'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useSession } from '../../../components/SessionProvider'
import { useAuthedSWR } from '../../../hooks/useAuthedSWR'
import { formatMoney } from '../../lib/price'

const PANELS = [
  { title: 'Users', description: 'Approve designers, review KYC, and manage roles.', action: 'Review queue', href: '/admin/users' },
  { title: 'Orders', description: 'Monitor escalations and refunds across regions.', action: 'View orders', href: '/admin/orders' },
  { title: 'Editorial', description: 'Publish stories and home page capsules.', action: 'Open CMS', href: '/stories' },
]

export default function AdminDashboardClient() {
  const router = useRouter()
  const { status, user } = useSession()
  const isAdmin = status === 'authenticated' && user?.role === 'admin'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent('/admin')}`)
    } else if (status === 'authenticated' && !isAdmin) {
      router.replace('/')
    }
  }, [status, isAdmin, router])

  const summary = useAuthedSWR('/api/dashboard/summary', { enabled: isAdmin })
  const customOrders = useAuthedSWR('/api/custom-orders', { enabled: isAdmin })
  const orders = useAuthedSWR('/api/orders', { enabled: isAdmin })

  if (status === 'idle' || status === 'loading') {
    return (
      <Container className="py-24 text-center text-muted">
        Checking admin access…
      </Container>
    )
  }

  if (!isAdmin) return null

  const cards = summary.data?.cards || []
  const briefsQueue = (customOrders.data?.orders || [])
    .filter((order) => ['requested', 'quoted'].includes(order.status))
    .slice(0, 5)
  const escalations = (orders.data?.orders || [])
    .filter((order) => ['pending_payment', 'cancelled', 'refunded', 'dispute_opened'].includes(order.status))
    .slice(0, 5)

  return (
    <div className="space-y-10 pb-16">
      <Container className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Control center</h1>
        <p className="text-muted">
          Secure area for membership approvals, orders, and content. Wire this to `/api/admin` endpoints.
        </p>
      </Container>

      <Container>
        <AutoGrid cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {cards.length === 0 && (
            <Card className="col-span-full text-center text-sm text-muted">
              Live metrics will appear once the API responds.
            </Card>
          )}
          {cards.map((card) => (
            <Card key={card.label} className="p-5 text-center">
              <p className="text-3xl font-serif">{card.value}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-muted mt-2">{card.label}</p>
            </Card>
          ))}
        </AutoGrid>
        {(summary.isLoading || summary.error) && (
          <p className="text-xs text-muted mt-2">
            {summary.isLoading ? 'Syncing summary…' : 'Unable to refresh summary — showing defaults.'}
          </p>
        )}
      </Container>

      <Container className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Designer queue</p>
              <h2 className="text-2xl font-serif">Custom briefs</h2>
            </div>
            <Button as={Link} href="/admin/users" variant="secondary" size="sm">
              Manage designers
            </Button>
          </div>
          {(customOrders.isLoading || customOrders.error) && (
            <p className="text-xs text-muted">
              {customOrders.isLoading ? 'Checking briefs…' : 'Unable to load briefs.'}
            </p>
          )}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {briefsQueue.length === 0 && <p className="text-sm text-muted">No briefs need action.</p>}
            {briefsQueue.map((order) => (
              <Card key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">{order.status}</p>
                  <p className="text-lg font-serif">{order.title}</p>
                </div>
                <Button as={Link} href={`/custom-order/${order.id}`} variant="secondary" size="sm">
                  Review
                </Button>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Escalations</p>
              <h2 className="text-2xl font-serif">Orders needing attention</h2>
            </div>
            <Button as={Link} href="/admin/orders" variant="secondary" size="sm">
              View all
            </Button>
          </div>
          {(orders.isLoading || orders.error) && (
            <p className="text-xs text-muted">
              {orders.isLoading ? 'Loading escalations…' : 'Unable to load orders.'}
            </p>
          )}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {escalations.length === 0 && <p className="text-sm text-muted">No escalations right now.</p>}
            {escalations.map((order) => (
              <Card key={order.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{order.status}</p>
                    <p className="text-lg font-serif">
                      {order.type === 'custom' ? 'Custom commission' : 'Catalog order'}
                    </p>
                  </div>
                  <Badge>{order.currency || 'USD'}</Badge>
                </div>
                <p className="text-xs text-muted">
                  Total {order.totalCents ? formatMoney(order.totalCents, order.currency) : 'TBD'} · Updated{' '}
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'recently'}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </Container>

      <Container>
        <AutoGrid cols="grid-cols-1 md:grid-cols-3">
          {PANELS.map((panel) => (
            <Card key={panel.title} className="p-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{panel.title}</p>
              <h2 className="text-2xl font-serif">{panel.description}</h2>
              <Button as={Link} href={panel.href} variant="secondary" className="w-full justify-center">
                {panel.action}
              </Button>
            </Card>
          ))}
        </AutoGrid>
      </Container>
    </div>
  )
}
