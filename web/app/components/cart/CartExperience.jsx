'use client'

import { useCallback, useMemo, useState } from 'react'
import { Link } from '@/navigation'
import Card from '../ui/Card'
import Container from '../ui/Container'
import Button from '../ui/Button'
import AutoGrid from '../ui/AutoGrid'
import Badge from '../ui/Badge'
import { useSession } from '../../../components/SessionProvider'
import { useAuthedSWR } from '../../../hooks/useAuthedSWR'
import { useCurrency } from '@/components/CurrencyProvider'

const EMPTY_ORDER = {
  items: [],
  subtotalCents: 0,
  taxCents: 0,
  shippingCents: 0,
  totalCents: 0,
  currency: 'USD',
}

function SummaryCard({ order, isProcessing, formatAmount, activeCurrency, rateSourceLabel }) {
  const subtotal = order?.subtotalCents || 0
  const tax = order?.taxCents || 0
  const shipping = order?.shippingCents ?? 0
  const total = order?.totalCents || subtotal + tax + (shipping || 0)

  return (
    <Card className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-serif">Summary</h2>
        <p className="text-sm text-muted">Concierge will confirm fabrics, fittings, and delivery windows.</p>
      </div>

      <dl className="space-y-2 text-sm text-muted">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatAmount(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Tax</dt><dd>{formatAmount(tax)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? 'Complimentary' : formatAmount(shipping)}</dd></div>
      </dl>

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">Total</span>
        <span className="text-3xl font-serif">{formatAmount(total)}</span>
      </div>

      <Button className="w-full justify-center" disabled={isProcessing || (order?.items?.length ?? 0) === 0}>
        Secure checkout
      </Button>

      <p className="text-xs text-muted text-center">
        You will confirm preferred atelier, measurements, and shipping address on the next step.
      </p>
      <p className="text-[11px] text-muted text-center">
        Showing in {activeCurrency} • {rateSourceLabel}
      </p>
    </Card>
  )
}

export default function CartExperience() {
  const { status, token } = useSession()
  const { format, currency: activeCurrency, rateSource } = useCurrency()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data, isLoading, error, mutate } = useAuthedSWR('/api/orders/cart')
  const rawOrder = data?.order

  const order = useMemo(() => {
    if (!rawOrder) return EMPTY_ORDER
    return {
      ...EMPTY_ORDER,
      ...rawOrder,
      items: rawOrder.items ?? [],
    }
  }, [rawOrder])

  const items = order.items
  const rateSourceLabel = rateSource?.asOf
    ? `Rates ${rateSource.asOf} via ${rateSource.provider}`
    : `Rates via ${rateSource?.provider || 'FX snapshot'}`
  const formatOrderAmount = useCallback(
    (amountCents = 0) => format(amountCents, { fromCurrency: order.currency || 'USD' }),
    [format, order.currency],
  )

  const handleRemove = useCallback(
    async (productId) => {
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
    },
    [token, mutate],
  )

  const itemCount = items.length
  const totalsCopy = itemCount === 0 ? 'Cart empty' : `${itemCount} ${itemCount === 1 ? 'piece' : 'pieces'}`

  if (status === 'idle' || status === 'loading' || isLoading) {
    return (
      <Container className="py-24 text-center text-muted">
        Loading your cart…
      </Container>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Container className="py-24">
        <Card className="space-y-4 text-center">
          <h1 className="text-3xl font-serif">Sign in to access your cart</h1>
          <p className="text-muted">
            Saved looks, concierge chats, and checkout are available once you authenticate.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button as={Link} href="/login" className="flex-1 justify-center">
              Sign in
            </Button>
            <Button
              as={Link}
              href="/register"
              variant="secondary"
              className="flex-1 justify-center"
            >
              Create account
            </Button>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <div className="space-y-12 pb-24">
      <Container className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Cart & Checkout</p>
        <h1 className="text-4xl font-serif">Curated looks ready to ship</h1>
        <p className="text-muted">{totalsCopy} • synced with your concierge team.</p>
      </Container>

      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {items.length === 0 && (
            <Card className="p-8 text-center text-muted">
              Your cart is empty. Browse the catalog and add pieces for concierge checkout.
            </Card>
          )}

          {items.map((item) => (
            <Card key={item.productId} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">By {item.designerName || item.designerId}</p>
                <h3 className="text-xl font-serif">{item.title}</h3>
                <p className="text-sm text-muted">Quantity: {item.quantity}</p>
              </div>
              <div className="flex flex-col items-end gap-3 text-right">
                <span className="text-lg font-serif">
                  {formatOrderAmount((item.priceCents || 0) * (item.quantity || 1))}
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(item.productId)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}

          {error && (
            <p className="text-xs text-rose-300">
              Unable to refresh cart — showing last known state.
            </p>
          )}
        </div>

        <div className="hidden lg:block">
          <SummaryCard
            order={order}
            isProcessing={isLoading}
            formatAmount={formatOrderAmount}
            activeCurrency={activeCurrency}
            rateSourceLabel={rateSourceLabel}
          />
        </div>
      </Container>

      <Container className="space-y-4">
        <SectionDivider />
        <AutoGrid cols="grid-cols-1 md:grid-cols-3">
          {['Secure payments', 'Priority shipping', 'Concierge styling'].map((label) => (
            <Card key={label} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{label}</p>
                <h4 className="text-lg font-serif">Included</h4>
              </div>
              <Badge variant="accent">24/7</Badge>
            </Card>
          ))}
        </AutoGrid>
      </Container>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
        <Card className="p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Total</p>
              <p className="text-2xl font-serif">{formatOrderAmount(order.totalCents || 0)}</p>
            </div>
            <Button className="w-40 justify-center" onClick={() => setDrawerOpen(true)}>
              Checkout
            </Button>
          </div>
        </Card>
      </div>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Checkout</p>
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </div>
            <SummaryCard
              order={order}
              isProcessing={isLoading}
              formatAmount={formatOrderAmount}
              activeCurrency={activeCurrency}
              rateSourceLabel={rateSourceLabel}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-white/10" />
}
