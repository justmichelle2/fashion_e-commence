import { useState } from 'react'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { PRODUCTS } from '../data/mockProducts'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = PRODUCTS.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Search</p>
        <h1 className="text-4xl font-serif">Find ateliers, looks, and services</h1>
        <p className="text-muted mt-2">Live data connects to our backend catalog; mocks show structure until the API is online.</p>
      </section>

      <div className="surface-glass p-6 rounded-2xl mb-8">
        <input
          className="form-input"
          placeholder="Tailored suit, embroidered gown..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {results.length === 0 && (
          <div className="surface-glass p-12 text-center text-muted">Try a different query or check with concierge for bespoke sourcing.</div>
        )}
      </div>
    </Layout>
  )
}
