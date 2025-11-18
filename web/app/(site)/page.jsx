import Link from 'next/link'
import Image from 'next/image'
import Hero from '../../components/Hero'
import DesignerCard from '../../components/DesignerCard'
import ProductCard from '../../components/ProductCard'
import SectionHeading from '../components/ui/SectionHeading'
import Container from '../components/ui/Container'
import AutoGrid from '../components/ui/AutoGrid'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { getProducts, getDesigners } from '../../lib/api'

const STAT_CARDS = [
  { label: 'Ateliers worldwide', value: '120+', detail: '28 fashion capitals' },
  { label: 'Custom fittings/mo', value: '1.4K', detail: 'Live concierge chats' },
  { label: 'Avg. lead time', value: '9 days', detail: 'Priority production' },
  { label: 'Net-zero partners', value: '68', detail: 'Certified supply chain' },
]

const CATEGORY_GRID = [
  {
    title: 'Eveningwear',
    blurb: 'Bias-cut silk, sculpted corsetry, luminous beadwork.',
    image: '/images/sample1.svg',
  },
  {
    title: 'Tailoring',
    blurb: 'Architectural suiting and elevated day-to-night separates.',
    image: '/images/sample2.svg',
  },
  {
    title: 'Resort',
    blurb: 'Weightless linens and eco-dyed palettes for itinerant wardrobes.',
    image: '/images/sample3.svg',
  },
  {
    title: 'Accessories',
    blurb: 'Limited-run artisan totes, sculptural jewelry, couture footwear.',
    image: '/images/sample4.svg',
  },
]

const FEATURED_SLIDER = [
  {
    title: 'Designer trunkshows',
    summary: 'Stream ateliers in Lagos, Paris, and Seoul with realtime chat.',
    image: '/images/sample2.svg',
  },
  {
    title: '3D fittings',
    summary: 'Approve pattern adjustments and pin notes on true-to-scale renders.',
    image: '/images/sample3.svg',
  },
  {
    title: 'Concierge sourcing',
    summary: 'Upload tear sheets, we locate archival fabrics within 48h.',
    image: '/images/sample4.svg',
  },
]

const TESTIMONIALS = [
  {
    quote: '“The atelier chat and 3D fittings meant zero surprises. My bridal look arrived flawless.”',
    author: 'Ama T., Lagos',
  },
  {
    quote: '“White-glove fabric sourcing helped me recreate a 90s archive gown in three weeks.”',
    author: 'Leila M., Dubai',
  },
  {
    quote: '“Designers upload sketches straight into my client boards—finally a single workspace.”',
    author: 'Jonas P., NYC',
  },
]

export default async function HomePage() {
  const [productRes, designerRes] = await Promise.all([
    getProducts('?limit=9').catch(() => ({ products: [] })),
    getDesigners().catch(() => ({ designers: [] })),
  ])

  const products = productRes?.products ?? []
  const designers = designerRes?.designers ?? []

  return (
    <div className="space-y-20">
      <Container as="section" className="space-y-8">
        <Hero
          title="Made-to-measure luxury, shipped globally"
          subtitle="Connect with ateliers across continents, commission one-of-a-kind looks, and track every fitting in a single place."
          ctas={[
            { label: 'Explore catalog', href: '/catalog' },
            { label: 'Book a fitting', href: '/custom-order' },
          ]}
        />

        <AutoGrid className="text-center" cols="grid-cols-2 md:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <Card key={card.label} className="p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-muted">{card.label}</p>
              <p className="mt-3 text-3xl font-serif">{card.value}</p>
              <p className="mt-1 text-sm text-muted">{card.detail}</p>
            </Card>
          ))}
        </AutoGrid>
      </Container>

      <section className="space-y-10">
        <SectionHeading
          title="The latest capsule drops"
          description="Fresh edits added every Thursday"
          action={<Button as={Link} href="/catalog" variant="secondary">View all</Button>}
        />
        <Container>
          <AutoGrid>
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AutoGrid>
        </Container>
      </section>

      <section className="space-y-10">
        <SectionHeading
          title="Category moods"
          description="Concierge styling, atelier visits, and white-glove delivery"
        />
        <Container>
          <AutoGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_GRID.map((item) => (
              <Card key={item.title} className="p-6 space-y-4">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 100vw"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-serif">{item.title}</h4>
                  <p className="text-sm text-muted mt-2">{item.blurb}</p>
                </div>
                <Button variant="secondary" size="sm">Reserve look</Button>
              </Card>
            ))}
          </AutoGrid>
        </Container>
      </section>

      <section className="space-y-8">
        <SectionHeading
          title="Experiences"
          description="Immersive drops, concierge sourcing, bespoke fittings"
        />
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-[600px] px-4 sm:px-6 lg:px-8">
            {FEATURED_SLIDER.map((feature) => (
              <Card key={feature.title} className="flex w-80 flex-shrink-0 flex-col gap-4">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Badge variant="accent">Featured</Badge>
                  <h4 className="mt-3 text-xl font-serif">{feature.title}</h4>
                  <p className="text-sm text-muted mt-2">{feature.summary}</p>
                </div>
                <Button variant="secondary">Book</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <SectionHeading
          title="Resident designers"
          description="Meet the ateliers shaping modern luxury"
        />
        <Container>
          <AutoGrid cols="grid-cols-1 md:grid-cols-3">
            {designers.slice(0, 3).map((designer) => (
              <DesignerCard key={designer.id} designer={designer} />
            ))}
          </AutoGrid>
        </Container>
      </section>

      <section className="space-y-10">
        <SectionHeading
          title="Testimonials"
          description="Stories from our clientele"
        />
        <Container>
          <AutoGrid cols="grid-cols-1 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Card key={item.author} className="p-6 space-y-4">
                <p className="text-lg font-serif">{item.quote}</p>
                <p className="text-sm text-muted">{item.author}</p>
              </Card>
            ))}
          </AutoGrid>
        </Container>
      </section>
    </div>
  )
}
