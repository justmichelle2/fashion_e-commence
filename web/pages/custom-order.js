import { useMemo, useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import SectionHeader from '../components/SectionHeader'
import CustomOrderCard from '../components/CustomOrderCard'
import { useLocale } from '../components/LocaleProvider'
import { useSession } from '../components/SessionProvider'
import { useAuthedSWR } from '../hooks/useAuthedSWR'

const STEP_KEYS = ['upload', 'collaborate', 'approve']

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
  const { t } = useLocale()
  const { status, token, user } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { data, isLoading: isOrdersLoading, mutate, error } = useAuthedSWR('/api/custom-orders', {
    enabled: isAuthenticated,
  })
  const orders = data?.orders || []
  const [form, setForm] = useState(INITIAL_FORM)
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copy = useMemo(
    () => ({
      hero: {
        eyebrow: t('pages.customOrder.eyebrow', 'Custom Atelier'),
        title: t('pages.customOrder.title', 'Commission one-of-one looks with concierge support'),
        body: t(
          'pages.customOrder.body',
          'Upload inspiration, chat with designers in realtime, approve sketches, and pay securely—all in a single workspace.',
        ),
        primaryCta: t('pages.customOrder.primaryCta', 'Get started'),
        secondaryCta: t('pages.customOrder.secondaryCta', 'Sign in'),
        briefTitle: t('pages.customOrder.briefTitle', 'Brief your atelier'),
      },
      form: {
        projectName: t('pages.customOrder.form.projectName', 'Project name'),
        projectPlaceholder: t('pages.customOrder.form.projectPlaceholder', 'Evening cape with beadwork'),
        occasion: t('pages.customOrder.form.occasion', 'Occasion'),
        occasionPlaceholder: t('pages.customOrder.form.occasionPlaceholder', 'Gala, ceremony, editorial...'),
        size: t('pages.customOrder.form.size', 'Measurements / Size'),
        sizePlaceholder: t('pages.customOrder.form.sizePlaceholder', 'US 6, tailored fit, 180cm'),
        colorPalette: t('pages.customOrder.form.colorPalette', 'Color palette'),
        colorPlaceholder: t('pages.customOrder.form.colorPlaceholder', 'Emerald, silver hardware'),
        fabric: t('pages.customOrder.form.fabric', 'Fabric preferences'),
        fabricPlaceholder: t('pages.customOrder.form.fabricPlaceholder', 'Silk crepe, upcycled materials'),
        notes: t('pages.customOrder.form.notes', 'Notes'),
        notesPlaceholder: t('pages.customOrder.form.notesPlaceholder', 'Fabric, silhouette, timeline'),
        shipping: t('pages.customOrder.form.shipping', 'Shipping / fitting city'),
        shippingPlaceholder: t('pages.customOrder.form.shippingPlaceholder', 'Accra, Ghana'),
        signedOutLabel: t(
          'pages.customOrder.form.signedOutLabel',
          "Sign in to submit a brief. We'll route it to designers instantly.",
        ),
        submit: t('pages.customOrder.form.submit', 'Submit brief'),
        submitting: t('pages.customOrder.form.submitting', 'Sending…'),
        upload: t('pages.customOrder.form.upload', 'Upload inspiration'),
      },
      notifications: {
        success: t('pages.customOrder.feedback.success', 'Brief sent. Concierge will respond shortly.'),
        genericError: t('pages.customOrder.feedback.error', 'Unable to submit brief'),
      },
      steps: {
        title: t('pages.customOrder.steps.title', 'How it works'),
        subtitle: t(
          'pages.customOrder.steps.subtitle',
          'Each commission flows through the same transparent milestones',
        ),
        eyebrow: t('pages.customOrder.steps.eyebrow', 'Step'),
      },
      help: {
        title: t('pages.customOrder.help.title', 'Need help?'),
        subtitle: t('pages.customOrder.help.subtitle', 'Concierge stylists respond within minutes.'),
        body: t(
          'pages.customOrder.help.body',
          'Our global concierge can suggest designers, review measurements, or help upload assets. Reach us 24/7.',
        ),
        emailCta: t('pages.customOrder.help.emailCta', 'Email concierge'),
        chatCta: t('pages.customOrder.help.chatCta', 'Open chat'),
      },
      commissions: {
        title: t('pages.customOrder.commissions.title', 'Your commissions'),
        subtitle: t('pages.customOrder.commissions.subtitle', 'Track every custom brief in one place'),
        loading: t('pages.customOrder.commissions.loading', 'Loading your requests…'),
        empty: t('pages.customOrder.commissions.empty', 'No briefs yet. Submit a project to see its status here.'),
        error: t('pages.customOrder.commissions.error', 'Unable to refresh commissions right now.'),
      },
    }),
    [t],
  )

  const steps = useMemo(
    () =>
      STEP_KEYS.map((key, index) => {
        const defaults = [
          {
            title: 'Upload inspiration',
            copy: 'Share sketches, reference photos, or measurements so ateliers understand your brief.',
          },
          {
            title: 'Collaborate in chat',
            copy: 'Message designers, pin swatches, and review sketches directly inside the order timeline.',
          },
          {
            title: 'Approve + pay',
            copy: 'Lock in the quote, pay the deposit securely, and track milestones through delivery.',
          },
        ][index]
        return {
          title: t(`pages.customOrder.steps.${key}.title`, defaults.title),
          copy: t(`pages.customOrder.steps.${key}.copy`, defaults.copy),
        }
      }),
    [t],
  )

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
      setMessage({ type: 'success', text: copy.notifications.success })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || copy.notifications.genericError })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <section className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">{copy.hero.eyebrow}</p>
        <div className="mt-2 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">{copy.hero.title}</h1>
            <p className="text-muted">{copy.hero.body}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/account/register" className="btn-primary">{copy.hero.primaryCta}</Link>
              <Link href="/account/login" className="btn-secondary">{copy.hero.secondaryCta}</Link>
            </div>
          </div>
          <div className="surface-glass rounded-2xl p-6 space-y-4 lg:w-2/5">
            <h2 className="text-xl font-serif">{copy.hero.briefTitle}</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.projectName}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.projectPlaceholder}
                  value={form.title}
                  onChange={handleChange('title')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.occasion}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.occasionPlaceholder}
                  value={form.occasion}
                  onChange={handleChange('occasion')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.size}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.sizePlaceholder}
                  value={form.size}
                  onChange={handleChange('size')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.colorPalette}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.colorPlaceholder}
                  value={form.colorPalette}
                  onChange={handleChange('colorPalette')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.fabric}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.fabricPlaceholder}
                  value={form.fabricPreference}
                  onChange={handleChange('fabricPreference')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.notes}
                <textarea
                  className="form-input mt-2"
                  rows={4}
                  placeholder={copy.form.notesPlaceholder}
                  value={form.notes}
                  onChange={handleChange('notes')}
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted">
                {copy.form.shipping}
                <input
                  className="form-input mt-2"
                  placeholder={copy.form.shippingPlaceholder}
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
                  {copy.form.signedOutLabel}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <button type="submit" className="btn-primary" disabled={!isAuthenticated || isSubmitting}>
                  {isSubmitting ? copy.form.submitting : copy.form.submit}
                </button>
                <button type="button" className="btn-secondary" disabled={!isAuthenticated}>
                  {copy.form.upload}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader title={copy.steps.title} subtitle={copy.steps.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <article key={step.title} className="surface-glass p-6 rounded-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{copy.steps.eyebrow}</p>
              <h3 className="text-2xl font-serif">{step.title}</h3>
              <p className="text-sm text-muted">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-glass p-8 rounded-2xl">
        <SectionHeader title={copy.help.title} subtitle={copy.help.subtitle} />
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <p className="text-muted">{copy.help.body}</p>
          </div>
          <div className="flex gap-3">
            <Link href="mailto:concierge@luxeatelier.com" className="btn-secondary">{copy.help.emailCta}</Link>
            <Link href="/account/login" className="btn-primary">{copy.help.chatCta}</Link>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="surface-glass p-8 rounded-2xl mt-12">
          <SectionHeader title={copy.commissions.title} subtitle={copy.commissions.subtitle} />
          {isOrdersLoading && <p className="text-muted">{copy.commissions.loading}</p>}
          {!isOrdersLoading && orders.length === 0 && (
            <p className="text-muted">{copy.commissions.empty}</p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {orders.map((order) => (
              <CustomOrderCard key={order.id} order={order} role={user?.role || 'customer'} />
            ))}
          </div>
          {error && <p className="text-xs text-rose-300 mt-4">{copy.commissions.error}</p>}
        </section>
      )}
    </Layout>
  )
}
