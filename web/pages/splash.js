import { useMemo } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useLocale } from '../components/LocaleProvider'

export default function SplashPage() {
  const { t } = useLocale()
  const strings = useMemo(
    () => ({
      eyebrow: t('pages.splash.eyebrow', 'Luxe Atelier'),
      title: t('pages.splash.title', 'A new way to commission fashion'),
      body: t(
        'pages.splash.body',
        'We connect you to vetted ateliers worldwide with concierge chat, realtime fittings, and carbon-neutral logistics.',
      ),
      primary: t('pages.splash.primaryCta', 'Join waitlist'),
      secondary: t('pages.splash.secondaryCta', 'Browse catalog'),
    }),
    [t],
  )

  return (
    <Layout>
      <section className="hero-gradient rounded-3xl p-10 flex flex-col gap-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{strings.eyebrow}</p>
        <h1 className="text-5xl font-serif leading-snug">{strings.title}</h1>
        <p className="text-lg opacity-90 max-w-3xl">{strings.body}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/account/register" className="btn-primary">{strings.primary}</Link>
          <Link href="/catalog" className="btn-secondary">{strings.secondary}</Link>
        </div>
      </section>
    </Layout>
  )
}
