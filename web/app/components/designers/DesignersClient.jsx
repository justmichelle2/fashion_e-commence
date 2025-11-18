'use client'

import Link from 'next/link'
import Image from 'next/image'
import DesignerCard from '../../../components/DesignerCard'
import Container from '../ui/Container'
import AutoGrid from '../ui/AutoGrid'
import Card from '../ui/Card'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import Badge from '../ui/Badge'

const STATS = [
  { value: '87', label: 'Emerging voices' },
  { value: '42', label: 'Heritage houses' },
  { value: '5', label: 'Continents represented' },
]

const FEATURE_STORIES = [
  {
    title: 'Atelier Lagos',
    summary: 'Hand-painted silks and ceremonial looks for modern weddings.',
    image: '/images/sample2.svg',
  },
  {
    title: 'Nordic knit lab',
    summary: 'Experimental knitwear with biodegradable yarns.',
    image: '/images/sample3.svg',
  },
]

export default function DesignersClient({ designers = [] }) {
  return (
    <div className="space-y-12 pb-16">
      <Container className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:w-3/5 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Designers</p>
            <h1 className="text-4xl md:text-5xl font-serif">Meet the ateliers redefining luxury</h1>
            <p className="text-muted">
              From bespoke suiting in Lagos to experimental knitwear in Copenhagen, collaborate with verified studios and track every fitting from your dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} href="/custom-order">
              Start commission
            </Button>
            <Button as={Link} href="/stories" variant="secondary">
              Read profiles
            </Button>
          </div>
        </div>

        <AutoGrid cols="grid-cols-1 md:grid-cols-3">
          {STATS.map((stat) => (
            <Card key={stat.label} className="p-6 text-center space-y-2">
              <p className="text-3xl font-serif">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">{stat.label}</p>
            </Card>
          ))}
        </AutoGrid>
      </Container>

      <Container className="space-y-6">
        <SectionHeading
          title="Resident studios"
          description="Your personal concierge can intro you within minutes"
        />
        <AutoGrid>
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}
        </AutoGrid>
      </Container>

      <Container className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-4">
          <h3 className="text-2xl font-serif">Open call for designers</h3>
          <p className="text-muted">
            Showcase your capsule collection to a global membership that values sustainability, craftsmanship, and provenance.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted">
            <li>Concierge onboarding with payout automation.</li>
            <li>Live chat with clients plus AR fitting approvals.</li>
            <li>Access to our carbon-neutral logistics network.</li>
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} href="/designer/apply" className="flex-1 justify-center">
              Apply to join
            </Button>
            <Button
              as={Link}
              href="mailto:curation@luxeatelier.com"
              variant="secondary"
              className="flex-1 justify-center"
            >
              Speak with curation
            </Button>
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Spotlight</p>
            <h3 className="text-lg font-serif">Featured ateliers</h3>
          </div>
          <div className="space-y-4">
            {FEATURE_STORIES.map((story) => (
              <article key={story.title} className="flex gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                  <Image src={story.image} alt={story.title} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{story.title}</p>
                  <p className="text-xs text-muted">{story.summary}</p>
                </div>
              </article>
            ))}
          </div>
          <Badge variant="accent" className="self-start">Weekly curation</Badge>
        </Card>
      </Container>
    </div>
  )
}
