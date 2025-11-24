import dynamic from 'next/dynamic'

const ProfileClient = dynamic(
  () => import('../../../components/profile/ProfileClient'),
  { ssr: false }
)

export const metadata = {
  title: 'Profile — Luxe Atelier',
  description: 'Manage your measurement profiles, concierge preferences, and contact info.',
}

export default function ProfilePage() {
  return <ProfileClient />
}
