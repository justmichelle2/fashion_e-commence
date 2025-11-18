import Link from 'next/link'
import Layout from '../components/Layout'
import DesignerCard from '../components/DesignerCard'
import SectionHeader from '../components/SectionHeader'
import { DESIGNERS as MOCK_DESIGNERS } from '../data/mockProducts'
import { getDesigners } from '../lib/api'

const STATS = [
  { value: '87', label: 'Emerging voices' },
  { value: '42', label: 'Heritage houses' },
  { value: '5', label: 'Continents represented' }
]

export default function Designers({ designers = [] }){
  const featured = designers.length ? designers : MOCK_DESIGNERS

  return (
    <Layout>
      <section className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Designers</p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-3">
          <div className="lg:w-3/5">
            <h1 className="text-4xl md:text-5xl font-serif">Meet the ateliers redefining luxury</h1>
            <p className="text-muted mt-4">From bespoke suiting in Lagos to experimental knitwear in Copenhagen, collaborate with verified studios and track every fitting from your dashboard.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/custom-order" className="btn-primary">Start commission</Link>
            <Link href="/stories" className="btn-secondary">Read profiles</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 surface-glass p-6 mb-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-serif">{stat.value}</div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mt-2">{stat.label}</p>
          </div>
        ))}
      </section>

      <SectionHeader title="Resident studios" subtitle="Your personal concierge can intro you within minutes" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {featured.map((designer) => (
          <DesignerCard key={designer.id} designer={designer} />
        ))}
      </div>

      <section className="surface-glass p-8 mt-16 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <h3 className="text-2xl font-serif">Open call for designers</h3>
          <p className="text-muted mt-3">Showcase your capsule collection to a global membership that values sustainability, craftsmanship, and provenance.</p>
          <ul className="mt-4 text-sm text-muted space-y-2 list-disc list-inside">
            <li>Concierge onboarding with payout automation.</li>
            <li>Live chat with clients plus AR fitting approvals.</li>
            <li>Access to our carbon-neutral logistics network.</li>
          </ul>
        </div>
        <div className="lg:w-1/3 flex flex-col gap-3">
          <Link href="/designer/apply" className="btn-primary text-center">Apply to join</Link>
          <Link href="mailto:curation@luxeatelier.com" className="btn-secondary text-center">Speak with curation</Link>
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps(){
  const res = await getDesigners().catch(() => ({ designers: MOCK_DESIGNERS }))
  return {
    props: {
      designers: res?.designers?.length ? res.designers : MOCK_DESIGNERS
    },
    revalidate: 120
  }
}
