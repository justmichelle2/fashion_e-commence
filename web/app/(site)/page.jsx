import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
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

const STAT_KEYS = ['ateliers', 'fittings', 'leadTime', 'netZero']
const CATEGORY_KEYS = ['eveningwear', 'tailoring', 'resort', 'accessories']
const EXPERIENCE_KEYS = ['trunkshow', 'fittings', 'concierge']
const TESTIMONIAL_KEYS = ['ama', 'leila', 'jonas']
const CATEGORY_IMAGES = ['/images/sample1.svg', '/images/sample2.svg', '/images/sample3.svg', '/images/sample4.svg']
const EXPERIENCE_IMAGES = ['/images/sample2.svg', '/images/sample3.svg', '/images/sample4.svg']

export default async function HomePage() {
  const t = await getTranslations('Home')
  const [productRes, designerRes] = await Promise.all([
    getProducts('?limit=9').catch(() => ({ products: [] })),
    getDesigners().catch(() => ({ designers: [] })),
  ])

  const products = productRes?.products ?? []
  const designers = designerRes?.designers ?? []
  const stats = STAT_KEYS.map((key) => ({
    key,
    label: t(`stats.${key}.label`),
    value: t(`stats.${key}.value`),
    detail: t(`stats.${key}.detail`),
  }))
  const categories = CATEGORY_KEYS.map((key, index) => ({
    key,
    title: t(`categories.items.${key}.title`),
    blurb: t(`categories.items.${key}.blurb`),
    image: CATEGORY_IMAGES[index % CATEGORY_IMAGES.length],
  }))
  const experiences = EXPERIENCE_KEYS.map((key, index) => ({
    key,
    title: t(`experiences.items.${key}.title`),
    summary: t(`experiences.items.${key}.summary`),
    image: EXPERIENCE_IMAGES[index % EXPERIENCE_IMAGES.length],
  }))
  const testimonials = TESTIMONIAL_KEYS.map((key) => ({
    key,
    quote: t(`testimonials.items.${key}.quote`),
    author: t(`testimonials.items.${key}.author`),
  }))

  return (
    <div className="space-y-20">
      <Container as="section" className="space-y-8">
        <Hero />

        <AutoGrid className="text-center" cols="grid-cols-2 md:grid-cols-4">
          {stats.map((card) => (
            <Card key={card.key} className="p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-muted">{card.label}</p>
              <p className="mt-3 text-3xl font-serif">{card.value}</p>
              <p className="mt-1 text-sm text-muted">{card.detail}</p>
            </Card>
          ))}
        </AutoGrid>
      </Container>

      <section className="space-y-10">
        <SectionHeading
          title={t('capsules.title')}
          description={t('capsules.description')}
          action={
            <Button as={Link} href="/catalog" variant="secondary">
              {t('buttons.viewAll', 'View all')}
            </Button>
          }
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
          title={t('categories.title')}
          description={t('categories.description')}
        />
        <Container>
          <AutoGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => (
              <Card key={item.key} className="p-6 space-y-4">
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
                <Button variant="secondary" size="sm">
                  {t('buttons.reserveLook', 'Reserve look')}
                </Button>
              </Card>
            ))}
          </AutoGrid>
        </Container>
      </section>

      <section className="space-y-8">
        <SectionHeading
          title={t('experiences.title')}
          description={t('experiences.description')}
        />
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-[600px] px-4 sm:px-6 lg:px-8">
            {experiences.map((feature) => (
              <Card key={feature.key} className="flex w-80 flex-shrink-0 flex-col gap-4">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Badge variant="accent">{t('experiences.featuredLabel', 'Featured')}</Badge>
                  <h4 className="mt-3 text-xl font-serif">{feature.title}</h4>
                  <p className="text-sm text-muted mt-2">{feature.summary}</p>
                </div>
                <Button variant="secondary">{t('buttons.book', 'Book')}</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <SectionHeading
          title={t('designers.title')}
          description={t('designers.description')}
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
          title={t('testimonials.title')}
          description={t('testimonials.description')}
        />
        <Container>
          <AutoGrid cols="grid-cols-1 md:grid-cols-3">
            {testimonials.map((item) => (
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
