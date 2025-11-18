import Layout from '../components/Layout'
import { useSession } from '../components/SessionProvider'
import { useAuthedSWR } from '../hooks/useAuthedSWR'
import { useRequireAuth } from '../hooks/useRequireAuth'

const formatMoney = (value, currency = 'USD') => {
  const amount = typeof value === 'number' ? value / 100 : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function CartPage() {
  const { status, isAuthorized } = useRequireAuth()
  const { token } = useSession()
  const { data, isLoading, error, mutate } = useAuthedSWR('/api/orders/cart')

  if (status === 'loading' || status === 'idle' || isLoading) {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading your cart…</section>
      </Layout>
    )
  }
  if (!isAuthorized) return null

  const order = data?.order
  const items = order?.items || []
  const currency = order?.currency || 'USD'
  const subtotal = order?.subtotalCents || 0
  const tax = order?.taxCents || 0
  const shipping = order?.shippingCents || 0
  const total = order?.totalCents || 0

  const handleRemove = async (productId) => {
    if (!productId || !token) return
    await fetch('/api/orders/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    }).catch(() => {})
    mutate()
  }

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Cart</p>
        <h1 className="text-4xl font-serif mt-2">Curated looks ready to ship</h1>
        <p className="text-muted mt-2">Sign in to sync with your concierge and keep carts across devices.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 && (
            <article className="card p-8 text-center text-muted">
              Your cart is empty. Browse the catalog and add pieces for concierge checkout.
            </article>
          )}
          {items.map((item) => (
            <article key={item.productId} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">By {item.designerName || item.designerId}</p>
                <h3 className="text-xl font-serif">{item.title}</h3>
                <p className="text-sm text-muted">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-serif">{formatMoney(item.priceCents * item.quantity, currency)}</p>
                <button onClick={() => handleRemove(item.productId)} className="btn-secondary mt-2">
                  Remove
                </button>
              </div>
            </article>
          ))}
          {error && <p className="text-xs text-rose-300">Unable to refresh cart — showing last known state.</p>}
        </div>
        <aside className="surface-glass p-6 rounded-2xl space-y-4">
          <h2 className="text-2xl font-serif">Summary</h2>
          <dl className="space-y-2 text-sm text-muted">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(subtotal, currency)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{formatMoney(tax, currency)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? 'Complimentary' : formatMoney(shipping, currency)}</dd></div>
          </dl>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Total</span>
            <span className="text-2xl font-serif">{formatMoney(total, currency)}</span>
          </div>
          <button className="btn-primary w-full" disabled={items.length === 0}>Secure checkout</button>
          <p className="text-xs text-muted text-center">Checkout requires signing in for concierge tracking.</p>
        </aside>
      </div>
    </Layout>
  )
}
