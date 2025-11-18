import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { PRODUCTS } from '../data/mockProducts'

export default function WishlistPage() {
  const { status, isAuthorized } = useRequireAuth()

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading wishlist…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  const saved = PRODUCTS.slice(0, 6)

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Wishlist</p>
        <h1 className="text-4xl font-serif">Looks you&apos;re tracking</h1>
        <p className="text-muted mt-2">Sign in to sync across devices and share with stylists.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Layout>
  )
}
