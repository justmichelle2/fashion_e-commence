import CatalogClient from '../../components/catalog/CatalogClient'
import { getProducts } from '../../lib/api'

export const metadata = {
  title: 'Catalog — Luxe Atelier',
  description: 'Explore bespoke edits, concierge tailoring, and capsule wardrobes from global ateliers.',
}

export default async function CatalogPage() {
  const res = await getProducts('?limit=24').catch(() => ({ products: [] }))
  const products = res?.products ?? []

  return <CatalogClient initialProducts={products} />
}
