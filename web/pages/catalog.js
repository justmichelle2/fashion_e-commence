import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { PRODUCTS as MOCK_PRODUCTS } from '../data/mockProducts'
import { getProducts } from '../lib/api'

const fetcher = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Network error')
  return r.json()
})

const CATEGORY_FILTERS = ['All', 'Dresses', 'Jackets', 'Resort', 'Accessories']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest drops' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' }
]

function getPrice(product){
  if (typeof product?.price === 'number') return product.price
  if (typeof product?.priceCents === 'number') return product.priceCents / 100
  return 0
}

function SkeletonCard(){
  return (
    <div className="card p-4 animate-pulse">
			<div className="h-64 skeleton-soft rounded-md" />
      <div className="mt-4 space-y-3">
				<div className="h-4 skeleton-strong rounded" />
				<div className="h-3 skeleton-soft rounded w-2/3" />
      </div>
    </div>
  )
}

function FilterChip({ active, children, ...props }){
  return (
    <button
      className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function Catalog({ initialProducts = [] }){
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('latest')
  const [bespokeOnly, setBespokeOnly] = useState(false)

  const { data, isLoading, error } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    fallbackData: { products: initialProducts }
  })

  const products = data?.products?.length ? data.products : initialProducts.length ? initialProducts : MOCK_PRODUCTS

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return products
      .filter((product) => {
        const title = product?.title?.toLowerCase() || ''
        const matchesSearch = !normalized || title.includes(normalized)
        const matchesCategory = category === 'All' || !category ? product?.category === category : true
        const matchesBespoke = !bespokeOnly || product?.isCustom || product?.category === 'Bespoke'
        return matchesSearch && matchesCategory && matchesBespoke
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return getPrice(a) - getPrice(b)
        if (sort === 'price-desc') return getPrice(b) - getPrice(a)
        return 0
      })
  }, [products, search, category, sort, bespokeOnly])

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Catalog</p>
        <h1 className="text-4xl md:text-5xl font-serif mt-3">Hand-picked edits and capsule wardrobes</h1>
        <p className="mt-3 text-muted max-w-2xl">
          Filter by category, search over 120 ateliers, and tap into concierge services for custom tailoring.
        </p>
      </section>

      <section className="surface-glass p-6 mb-10 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-[0.25em] text-muted">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Silk, tailoring, couture..."
					className="mt-2 form-input"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-muted">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
					className="mt-2 form-select"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {CATEGORY_FILTERS.map((label) => (
            <FilterChip key={label} active={category === label} onClick={() => setCategory(label)}>
              {label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="bespoke"
            checked={bespokeOnly}
            onChange={(e) => setBespokeOnly(e.target.checked)}
				className="form-checkbox"
          />
          <label htmlFor="bespoke" className="text-sm text-muted">Bespoke only</label>
        </div>
      </section>

      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Curated looks"
          subtitle={`${filtered.length} pieces${bespokeOnly ? ' • bespoke ateliers' : ''}`}
        />
        <span className="text-xs uppercase tracking-[0.2em] text-muted hidden md:inline">Updated hourly</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)}
        {!isLoading && filtered.length === 0 && (
          <div className="surface-glass col-span-full p-12 text-center">
            <p className="text-sm text-muted">No looks match your filters yet. Tap concierge to commission something new.</p>
          </div>
        )}
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {error && (
        <p className="text-xs text-rose-300 mt-6">Live catalog unavailable right now — showing sample data.</p>
      )}
    </Layout>
  )
}

export async function getStaticProps(){
  const res = await getProducts('?limit=18').catch(() => ({ products: MOCK_PRODUCTS }))
  return {
    props: {
      initialProducts: res?.products?.length ? res.products : MOCK_PRODUCTS
    },
    revalidate: 60
  }
}
