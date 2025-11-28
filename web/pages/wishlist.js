import { useMemo } from 'react'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { useLocale } from '../components/LocaleProvider'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useWishlist } from '../components/WishlistProvider'
import { Link } from '@/navigation'

export default function WishlistPage() {
  const { t } = useLocale()
  const { status, isAuthorized } = useRequireAuth()
  const { items, hydrated, clear } = useWishlist()

  const strings = useMemo(
    () => ({
      loading: t('pages.wishlist.loading', 'Loading wishlist…'),
      eyebrow: t('pages.wishlist.eyebrow', 'Wishlist'),
      title: t('pages.wishlist.title', "Looks you're tracking"),
      body: t('pages.wishlist.body', 'Sign in to sync across devices and share with stylists.'),
      empty: t('pages.wishlist.empty', 'No looks saved yet — tap the heart icon on any product to pin it here.'),
      explore: t('pages.wishlist.explore', 'Browse catalog'),
      clear: t('pages.wishlist.clear', 'Clear wishlist'),
    }),
    [t],
  )

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">{strings.loading}</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  if (!hydrated) {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">{strings.loading}</section>
      </Layout>
    )
  }

  const saved = items || []
  const hasItems = Boolean(saved.length)

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">{strings.eyebrow}</p>
        <h1 className="text-4xl font-serif">{strings.title}</h1>
        <p className="text-muted mt-2">{strings.body}</p>
        {hasItems && (
          <button
            type="button"
            onClick={clear}
            className="mt-4 text-xs uppercase tracking-[0.3em] text-rose-500 hover:text-rose-400"
          >
            {strings.clear}
          </button>
        )}
      </section>
      {hasItems ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-card-border p-10 text-center">
          <p className="text-lg text-muted">{strings.empty}</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-full border border-purple-400 px-6 py-3 text-xs uppercase tracking-[0.3em] text-purple-600"
          >
            {strings.explore}
          </Link>
        </div>
      )}
    </Layout>
  )
}
