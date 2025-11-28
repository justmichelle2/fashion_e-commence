import DashboardClient from '@/app/components/dashboard/DashboardClient'

export const metadata = {
    title: 'Dashboard — Luxe Atelier',
    description: 'Manage your orders and profile',
}

async function getOrders() {
    // TODO: Fetch from API based on user
    return []
}

async function getStats() {
    // TODO: Fetch stats from API
    return {
        totalOrders: 0,
        pending: 0,
        completed: 0,
        revenue: 0
    }
}

export default async function DashboardPage() {
    const orders = await getOrders()
    const stats = await getStats()

    return <DashboardClient orders={orders} stats={stats} />
}
