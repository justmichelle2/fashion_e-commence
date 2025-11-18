'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import ProductCard from '../../../components/ProductCard'
import SectionHeading from '../ui/SectionHeading'
import Container from '../ui/Container'
import AutoGrid from '../ui/AutoGrid'
import Card from '../ui/Card'
import Button from '../ui/Button'
import FilterChip from '../ui/FilterChip'

const CATEGORY_FILTERS = ['All', 'Dresses', 'Jackets', 'Resort', 'Accessories']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest drops' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
]

const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

function SkeletonCard() {
  return (
    <Card className="space-y-4 animate-pulse">
      <div className="h-64 rounded-2xl skeleton-soft" />
      <div className="space-y-2">
        <div className="h-4 rounded skeleton-strong" />
        <div className="h-3 w-1/2 rounded skeleton-soft" />
      </div>
    </Card>
  )
}

export default function CatalogClient({ initialProducts = [] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('latest')
  const [bespokeOnly, setBespokeOnly] = useState(false)

  const { data, isLoading, error } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    fallbackData: { products: initialProducts },
  })

  const products = data?.products?.length ? data.products : initialProducts

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return (products || [])
      .filter((product) => {
        const title = product?.title?.toLowerCase() || ''
        const matchesSearch = !normalized || title.includes(normalized)
        const matchesCategory = category === 'All' || !category ? product?.category === category : true
        const matchesBespoke = !bespokeOnly || product?.isCustom || product?.category === 'Bespoke'
        return matchesSearch && matchesCategory && matchesBespoke
      })
      .sort((a, b) => {
        const priceA = typeof a?.price === 'number' ? a.price : typeof a?.priceCents === 'number' ? a.priceCents / 100 : 0
        const priceB = typeof b?.price === 'number' ? b.price : typeof b?.priceCents === 'number' ? b.priceCents / 100 : 0
        if (sort === 'price-asc') return priceA - priceB
        if (sort === 'price-desc') return priceB - priceA
        return 0
      })
  }, [products, search, category, sort, bespokeOnly])

  return (
    <div className="space-y-12">
      <Container as="section" className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Catalog</p>
        <h1 className="text-4xl md:text-5xl font-serif">Hand-picked edits and capsule wardrobes</h1>
        <p className="text-muted max-w-2xl">
          Filter by category, search over 120 ateliers, and tap into concierge services for custom tailoring.
        </p>
      </Container>

      <Container className="space-y-8">
        <Card className="space-y-6">
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
            <div className="w-full lg:w-60">
              <label className="text-xs uppercase tracking-[0.25em] text-muted">Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-2 form-select">
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

          <label className="flex items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={bespokeOnly}
              onChange={(e) => setBespokeOnly(e.target.checked)}
              className="form-checkbox"
            />
            Bespoke only
          </label>
        </Card>
      </Container>

      <Container className="space-y-6">
        <SectionHeading
          title="Curated looks"
          description={`${filtered.length} pieces${bespokeOnly ? ' • bespoke ateliers' : ''}`}
          action={<span className="text-xs uppercase tracking-[0.2em] text-muted hidden md:inline">Updated hourly</span>}
        />

        <AutoGrid>
          {isLoading && Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)}
          {!isLoading && filtered.length === 0 && (
            <Card className="col-span-full text-center text-muted">
              No looks match your filters yet. Tap concierge to commission something new.
            </Card>
          )}
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AutoGrid>

        {error && (
          <p className="text-xs text-rose-300">
            Live catalog unavailable right now — showing sample data.
          </p>
        )}
      </Container>
    </div>
  )
}
