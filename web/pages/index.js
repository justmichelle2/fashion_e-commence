import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import DesignerCard from '../components/DesignerCard'
import SectionHeader from '../components/SectionHeader'
import { getProducts, getDesigners } from '../lib/api'

const STAT_CARDS = [
  { label: 'Ateliers worldwide', value: '120+' },
  { label: 'Bespoke fittings', value: '4.8 ⭐' },
  { label: 'Carbon-neutral partners', value: '68' },
  { label: 'Avg. lead time', value: '9 days' }
]

const CAPSULES = [
  { title: 'Monochrome Wardrobe', blurb: 'Architectural tailoring in obsidian and bone.', image: '/images/sample3.svg' },
  { title: 'Evening Botanicals', blurb: 'Hand-painted florals with liquid satin.', image: '/images/sample4.svg' },
  { title: 'Desert Bloom Resort', blurb: 'Weightless linens with luminous embroidery.', image: '/images/sample1.svg' }
]

const EDITORIAL = [
  { title: 'Inside Lagos ateliers', summary: 'How three rising designers reinvent ceremonial looks.' },
  { title: 'Fabric futures', summary: 'Regenerative silk and bio-sequined textiles under the spotlight.' },
  { title: 'Collector’s corner', summary: 'Limited drops sourced from archival houses and estate curators.' }
]

export default function Home({products = [], designers = []}){
  const trending = products.slice(0, 6)
  const featuredDesigners = designers.slice(0, 3)

  return (
    <Layout>
      <Hero
        title="Made-to-measure luxury, shipped globally"
        subtitle="Connect with ateliers across continents, commission one-of-a-kind looks, and track every fitting in a single place."
        ctas={[
          { label: 'Explore catalog', href: '/catalog' },
          { label: 'Book a fitting', href: '/custom-order' }
        ]}
      />

      <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="surface-glass p-4 text-center">
            <div className="text-2xl font-serif">{card.value}</div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted mt-2">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <SectionHeader
          title="The latest capsule drops"
          subtitle="Fresh edits added every Thursday"
          action={<Link href="/catalog" className="btn-secondary">View all</Link>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader
          title="Curated experiences"
          subtitle="Concierge styling, atelier visits, and white-glove delivery"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAPSULES.map(item => (
            <div key={item.title} className="card glow-ring p-6 flex flex-col gap-4">
              <div className="relative w-full h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  className="object-cover rounded-md"
                />
              </div>
              <div>
                <h4 className="text-lg font-serif">{item.title}</h4>
                <p className="text-sm text-muted mt-2">{item.blurb}</p>
              </div>
              <Link href="/custom-order" className="btn-secondary mt-auto">Reserve look</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 surface-glass p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Custom Atelier</p>
          <h3 className="text-3xl font-serif mt-2">Commission pieces with realtime chat + 3D fittings</h3>
          <ul className="mt-6 space-y-3 text-sm text-muted list-disc list-inside">
            <li>Upload sketches, inspiration boards, or mood reels directly from your device.</li>
            <li>Collaborate with stylists in chat threads that sync to your order timeline.</li>
            <li>Approve fabric swatches and payments from a single, secure dashboard.</li>
          </ul>
        </div>
        <div className="lg:w-1/3 flex flex-col gap-4 justify-center">
          <Link href="/custom-order" className="btn-primary w-full text-center">Start a custom order</Link>
          <Link href="/account/signup" className="btn-secondary w-full text-center">Meet your concierge</Link>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader title="Resident designers" subtitle="Meet the ateliers shaping modern luxury" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDesigners.map(designer => <DesignerCard key={designer.id} designer={designer} />)}
        </div>
      </section>

      <section className="mb-20">
        <SectionHeader title="Editorial" subtitle="Stories from our global fashion journal" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EDITORIAL.map(story => (
            <article key={story.title} className="surface-glass p-6 flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Feature</p>
              <h4 className="text-xl font-serif">{story.title}</h4>
              <p className="text-sm text-muted flex-1">{story.summary}</p>
              <Link href="/stories" className="text-sm theme-link">Read story</Link>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps(){
  const [productRes, designerRes] = await Promise.all([
    getProducts('?limit=9'),
    getDesigners()
  ])

  return {
    props: {
      products: productRes?.products || [],
      designers: designerRes?.designers || []
    },
    revalidate: 60
  }
}
