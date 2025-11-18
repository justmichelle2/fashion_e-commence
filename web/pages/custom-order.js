import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import SectionHeader from '../components/SectionHeader'
import CustomOrderCard from '../components/CustomOrderCard'
import { useSession } from '../components/SessionProvider'
import { useAuthedSWR } from '../hooks/useAuthedSWR'

const STEPS = [
  { title: 'Upload inspiration', copy: 'Share sketches, reference photos, or measurements so ateliers understand your brief.' },
  { title: 'Collaborate in chat', copy: 'Message designers, pin swatches, and review sketches directly inside the order timeline.' },
  { title: 'Approve + pay', copy: 'Lock in the quote, pay the deposit securely, and track milestones through delivery.' },
]

const INITIAL_FORM = {
  title: '',
  occasion: '',
  notes: '',
  size: '',
  colorPalette: '',
  fabricPreference: '',
  shippingAddress: '',
}

export default function CustomOrderPage() {
  const { status, token, user } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { data, isLoading: isOrdersLoading, mutate, error } = useAuthedSWR('/api/custom-orders', {
    enabled: isAuthenticated,
  })
  const orders = data?.orders || []
  const [form, setForm] = useState(INITIAL_FORM)
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isAuthenticated || !token) return
    setMessage(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.occasion,
          notes: form.notes,
          size: form.size,
          colorPalette: form.colorPalette,
          fabricPreference: form.fabricPreference,
          shippingAddress: form.shippingAddress,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Unable to submit brief')
      }
      await mutate()
      setForm(INITIAL_FORM)
      setMessage({ type: 'success', text: 'Brief sent. Concierge will respond shortly.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to submit brief' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <section className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Custom Atelier</p>
        <div className="mt-2 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Commission one-of-one looks with concierge support</h1>
            <p className="text-muted">Upload inspiration, chat with designers in realtime, approve sketches, and pay securely—all in a single workspace.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/account/register" className="btn-primary">Get started</Link>
              <Link href="/account/login" className="btn-secondary">Sign in</Link>
            </div>
          </div>
          <div className="surface-glass rounded-2xl p-6 space-y-4 lg:w-2/5">
            <h2 className="text-xl font-serif">Brief your atelier</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Project name
                <input
                  className="form-input mt-2"
                  placeholder="Evening cape with beadwork"
                  value={form.title}
                  onChange={handleChange('title')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Occasion
                <input
                  className="form-input mt-2"
                  placeholder="Gala, ceremony, editorial..."
                  value={form.occasion}
                  onChange={handleChange('occasion')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Measurements / Size
                <input
                  className="form-input mt-2"
                  placeholder="US 6, tailored fit, 180cm"
                  value={form.size}
                  onChange={handleChange('size')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Color palette
                <input
                  className="form-input mt-2"
                  placeholder="Emerald, silver hardware"
                  value={form.colorPalette}
                  onChange={handleChange('colorPalette')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Fabric preferences
                <input
                  className="form-input mt-2"
                  placeholder="Silk crepe, upcycled materials"
                  value={form.fabricPreference}
                  onChange={handleChange('fabricPreference')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Notes
                <textarea
                  className="form-input mt-2"
                  rows={4}
                  placeholder="Fabric, silhouette, timeline"
                  value={form.notes}
                  onChange={handleChange('notes')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                Shipping / fitting city
                <input
                  className="form-input mt-2"
                  placeholder="Accra, Ghana"
                  value={form.shippingAddress}
                  onChange={handleChange('shippingAddress')}
                  disabled={!isAuthenticated}
                />
              </label>
              {message && (
                <p className={`text-sm ${message.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {message.text}
                </p>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-muted">
                  Sign in to submit a brief. We&apos;ll route it to designers instantly.
                </p>
              )}
              <div className="flex flex-col gap-3">
                <button type="submit" className="btn-primary" disabled={!isAuthenticated || isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Submit brief'}
                </button>
                <button type="button" className="btn-secondary" disabled={!isAuthenticated}>
                  Upload inspiration
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader title="How it works" subtitle="Each commission flows through the same transparent milestones" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <article key={step.title} className="surface-glass p-6 rounded-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Step</p>
              <h3 className="text-2xl font-serif">{step.title}</h3>
              <p className="text-sm text-muted">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-glass p-8 rounded-2xl">
        <SectionHeader title="Need help?" subtitle="Concierge stylists respond within minutes." />
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <p className="text-muted">Our global concierge can suggest designers, review measurements, or help upload assets. Reach us 24/7.</p>
          </div>
          <div className="flex gap-3">
            <Link href="mailto:concierge@luxeatelier.com" className="btn-secondary">Email concierge</Link>
            <Link href="/account/login" className="btn-primary">Open chat</Link>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="surface-glass p-8 rounded-2xl mt-12">
          <SectionHeader title="Your commissions" subtitle="Track every custom brief in one place" />
          {isOrdersLoading && <p className="text-muted">Loading your requests…</p>}
          {!isOrdersLoading && orders.length === 0 && (
            <p className="text-muted">No briefs yet. Submit a project to see its status here.</p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {orders.map((order) => (
              <CustomOrderCard key={order.id} order={order} role={user?.role || 'customer'} />
            ))}
          </div>
          {error && <p className="text-xs text-rose-300 mt-4">Unable to refresh commissions right now.</p>}
        </section>
      )}
    </Layout>
  )
}
