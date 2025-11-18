import DesignersClient from '../../components/designers/DesignersClient'
import { getDesigners } from '../../lib/api'

export const metadata = {
  title: 'Designers — Luxe Atelier',
  description: 'Collaborate with verified ateliers across continents.',
}

export default async function DesignersPage() {
  const res = await getDesigners().catch(() => ({ designers: [] }))
  const designers = res?.designers ?? []

  return <DesignersClient designers={designers} />
}
