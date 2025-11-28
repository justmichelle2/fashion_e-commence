"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import { useLocale } from './LocaleProvider'

const HERO_TEXT_SLIDES = [
  {
    key: 'hero-default',
    labelKey: 'hero.carousel.label',
    labelFallback: 'Featured atelier',
    titleKey: 'hero.title',
    titleFallback: 'Made-to-measure luxury, shipped globally',
    bodyKey: 'hero.subtitle',
    bodyFallback:
      'Connect with ateliers across continents, commission one-of-a-kind looks, and track every fitting in a single place.',
  },
  {
    key: 'hero-carousel-atelier',
    labelKey: 'hero.carousel.label',
    labelFallback: 'Featured atelier',
    titleKey: 'hero.carousel.atelier.title',
    titleFallback: 'Seoul atelier',
    bodyKey: 'hero.carousel.atelier.caption',
    bodyFallback: 'Bespoke tailoring finished in five fittings with remote approvals.',
  },
  {
    key: 'hero-carousel-fittings',
    labelKey: 'hero.carousel.label',
    labelFallback: 'Featured atelier',
    titleKey: 'hero.carousel.fittings.title',
    titleFallback: 'Milan fittings',
    bodyKey: 'hero.carousel.fittings.caption',
    bodyFallback: 'Hand embroidery livestreamed nightly with designer notes.',
  },
  {
    key: 'hero-carousel-artisan',
    labelKey: 'hero.carousel.label',
    labelFallback: 'Featured atelier',
    titleKey: 'hero.carousel.artisan.title',
    titleFallback: 'Accra artisans',
    bodyKey: 'hero.carousel.artisan.caption',
    bodyFallback: 'Sustainable beadwork sourced locally and catalogued per piece.',
  },
  {
    key: 'hero-story-atelier-network',
    labelKey: 'hero.stories.atelier-network.eyebrow',
    labelFallback: 'Global network',
    titleKey: 'hero.stories.atelier-network.title',
    titleFallback: '14 atelier cities, one dossier',
    bodyKey: 'hero.stories.atelier-network.body',
    bodyFallback: 'Preview capsule drops from Accra to Antwerp and pin looks to your concierge brief.',
  },
  {
    key: 'hero-story-virtual-fitting',
    labelKey: 'hero.stories.virtual-fitting.eyebrow',
    labelFallback: 'Virtual fittings',
    titleKey: 'hero.stories.virtual-fitting.title',
    titleFallback: '3D measurements without tape',
    bodyKey: 'hero.stories.virtual-fitting.body',
    bodyFallback: 'Body-map capture plus AI fit notes keep every tweak synced across ateliers.',
  },
  {
    key: 'hero-story-concierge',
    labelKey: 'hero.stories.vip-concierge.eyebrow',
    labelFallback: 'Concierge',
    titleKey: 'hero.stories.vip-concierge.title',
    titleFallback: 'Priority chat threads',
    bodyKey: 'hero.stories.vip-concierge.body',
    bodyFallback: 'See sourcing updates, beadwork approvals, and fabric swaps in one encrypted log.',
  },
]

export default function Hero({ title, subtitle, ctas }) {
  const { t } = useLocale()
  const computedTitle = title ?? t('hero.title', 'Made-to-measure luxury, shipped globally')
  const computedSubtitle =
    subtitle ??
    t(
      'hero.subtitle',
      'Connect with ateliers across continents, commission one-of-a-kind looks, and track every fitting in a single place.',
    )
  const computedCtas =
    ctas && ctas.length
      ? ctas
      : [
          { label: t('hero.primaryCta', 'Explore catalog'), href: '/catalog' },
          { label: t('hero.secondaryCta', 'Book a fitting'), href: '/custom-order' },
        ]

  const slides = useMemo(
    () =>
      HERO_TEXT_SLIDES.map((slide) => ({
        ...slide,
        label: slide.labelKey ? t(slide.labelKey, slide.labelFallback) : slide.labelFallback,
        headline: slide.titleKey ? t(slide.titleKey, slide.titleFallback) : slide.titleFallback,
        body: slide.bodyKey ? t(slide.bodyKey, slide.bodyFallback) : slide.bodyFallback,
      })),
    [t],
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!slides.length) return undefined
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = useCallback(
    (direction) => {
      setActiveIndex((prev) => {
        if (direction === 'next') return (prev + 1) % slides.length
        if (direction === 'prev') return (prev - 1 + slides.length) % slides.length
        if (typeof direction === 'number') return direction
        return prev
      })
    },
    [slides.length],
  )

  const currentSlide = slides[activeIndex] || {}
  const heroLabel = currentSlide.label
  const heroHeading = currentSlide.headline || computedTitle
  const heroBody = currentSlide.body || computedSubtitle

  return (
    <section className="w-full hero-gradient rounded-lg p-8 md:p-12 mb-8 overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-start gap-8">
        <div className="lg:w-1/2">
          {heroLabel && (
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-3">{heroLabel}</p>
          )}
          <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-4 transition-opacity duration-500" key={heroHeading}>
            {heroHeading}
          </h1>
          <p className="text-lg mb-6 opacity-90 transition-opacity duration-500" key={heroBody}>
            {heroBody}
          </p>
          <div className="flex gap-3 flex-wrap">
            {computedCtas.map((cta) => (
              <Link key={cta.href} href={cta.href} className="btn-primary">
                {cta.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white"
              onClick={() => goToSlide('prev')}
              aria-label={t('hero.carousel.prev', 'Previous hero highlight')}
            >
              <span aria-hidden>&lt;</span>
            </button>
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.key}
                  type="button"
                  className={`h-2 w-8 rounded-full transition-colors ${index === activeIndex ? 'bg-white' : 'bg-white/30'}`}
                  aria-label={`${t('hero.carousel.goto', 'Go to slide')} ${index + 1}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white"
              onClick={() => goToSlide('next')}
              aria-label={t('hero.carousel.next', 'Next hero highlight')}
            >
              <span aria-hidden>&gt;</span>
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="card card-hover p-2">
              <div className="relative w-full h-64">
                <Image
                  src="/images/sample1.svg"
                  alt="hero1"
                  fill
                  priority
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="card card-hover p-2">
              <div className="relative w-full h-64">
                <Image
                  src="/images/sample2.svg"
                  alt="hero2"
                  fill
                  priority
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
