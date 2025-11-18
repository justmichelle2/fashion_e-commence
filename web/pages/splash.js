import Link from 'next/link'
import Layout from '../components/Layout'

export default function SplashPage() {
  return (
    <Layout>
      <section className="hero-gradient rounded-3xl p-10 flex flex-col gap-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Luxe Atelier</p>
        <h1 className="text-5xl font-serif leading-snug">A new way to commission fashion</h1>
        <p className="text-lg opacity-90 max-w-3xl">We connect you to vetted ateliers worldwide with concierge chat, realtime fittings, and carbon-neutral logistics.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/account/register" className="btn-primary">Join waitlist</Link>
          <Link href="/catalog" className="btn-secondary">Browse catalog</Link>
        </div>
      </section>
    </Layout>
  )
}
