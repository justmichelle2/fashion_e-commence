import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { useLocale } from '../components/LocaleProvider'
import { PRODUCTS } from '../data/mockProducts'

export default function SearchPage() {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return PRODUCTS
    return PRODUCTS.filter((product) => product.title.toLowerCase().includes(term))
  }, [query])

  const strings = useMemo(
    () => ({
      eyebrow: t('pages.search.eyebrow', 'Search'),
      title: t('pages.search.title', 'Find ateliers, looks, and services'),
      description: t(
        'pages.search.description',
        'Live data connects to our backend catalog; mocks show structure until the API is online.',
      ),
      placeholder: t('pages.search.placeholder', 'Tailored suit, embroidered gown...'),
      empty: t('pages.search.empty', 'Try a different query or check with concierge for bespoke sourcing.'),
    }),
    [t],
  )

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">{strings.eyebrow}</p>
        <h1 className="text-4xl font-serif">{strings.title}</h1>
        <p className="text-muted mt-2">{strings.description}</p>
      </section>

      <div className="surface-glass p-6 rounded-2xl mb-8">
        <input
          className="form-input"
          placeholder={strings.placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {results.length === 0 && (
          <div className="surface-glass p-12 text-center text-muted">{strings.empty}</div>
        )}
      </div>
    </Layout>
  )
}
