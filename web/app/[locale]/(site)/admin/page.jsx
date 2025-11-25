import dynamic from 'next/dynamic'

const AdminDashboardClient = dynamic(() => import('../../../components/admin/AdminDashboardClient'), { ssr: false })

export const metadata = {
  title: 'Admin Dashboard — Luxe Atelier',
  description: 'Monitor membership approvals, orders, and escalations.',
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}
