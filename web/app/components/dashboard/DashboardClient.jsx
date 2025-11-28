'use client'

import { useEffect } from 'react'
import { Link, useRouter } from '@/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import AutoGrid from '../ui/AutoGrid'
import { useSession } from '../../../components/SessionProvider'
import { useLocale } from '@/components/LocaleProvider'

export default function DashboardClient({ orders = [], stats = {} }) {
    const router = useRouter()
    const { user, status } = useSession()
    const { locale } = useLocale()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace(`/login?redirect=${encodeURIComponent(`/${locale}/dashboard`)}`)
        }
    }, [status, router, locale])

    if (status === 'loading') {
        return (
            <Container className="py-24 text-center">
                <p className="text-muted">Loading dashboard...</p>
            </Container>
        )
    }

    if (!user) return null

    const isDesigner = user.role === 'designer'

    return (
        <Container className="py-12 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                <h1 className="text-4xl font-serif">
                    {isDesigner ? 'Designer Dashboard' : 'My Dashboard'}
                </h1>
                <p className="text-muted mt-2">
                    {isDesigner
                        ? 'Manage your commissions, portfolio, and clients'
                        : 'Track your orders and custom requests'
                    }
                </p>
                </div>
                <Button as={Link} href="/profile" variant="secondary" size="sm">
                    Edit profile
                </Button>
            </div>

            {/* Stats */}
            <AutoGrid cols="grid-cols-1 md:grid-cols-4">
                <Card className="p-6 text-center">
                    <p className="text-3xl font-serif">{stats.totalOrders || 0}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted mt-2">
                        {isDesigner ? 'Active Commissions' : 'Total Orders'}
                    </p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-serif">{stats.pending || 0}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted mt-2">
                        Pending
                    </p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-serif">{stats.completed || 0}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted mt-2">
                        Completed
                    </p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-serif">${stats.revenue || 0}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted mt-2">
                        {isDesigner ? 'Total Earnings' : 'Total Spent'}
                    </p>
                </Card>
            </AutoGrid>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-2xl font-serif mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    {isDesigner ? (
                        <>
                            <Button as={Link} href="/portfolio">Manage Portfolio</Button>
                            <Button as={Link} href="/messages" variant="secondary">View Messages</Button>
                            <Button as={Link} href="/profile" variant="secondary">Edit Profile</Button>
                        </>
                    ) : (
                        <>
                            <Button as={Link} href="/custom-order">Request Custom Design</Button>
                            <Button as={Link} href="/catalog">Browse Catalog</Button>
                            <Button as={Link} href="/messages" variant="secondary">Message Designers</Button>
                            <Button as={Link} href="/profile" variant="secondary">Update Measurements</Button>
                        </>
                    )}
                </div>
            </Card>

            {/* Recent Orders/Commissions */}
            <div className="space-y-4">
                <h2 className="text-2xl font-serif">
                    {isDesigner ? 'Recent Commissions' : 'Recent Orders'}
                </h2>
                {orders.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted">
                            {isDesigner ? 'No commissions yet' : 'No orders yet'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Card key={order.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-serif text-lg">{order.title || 'Custom Order'}</h3>
                                        <p className="text-sm text-muted">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge>{order.status}</Badge>
                                        <p className="font-semibold">${order.amount || 0}</p>
                                        <Button as={Link} href={`/orders/${order.id}`} size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    )
}
