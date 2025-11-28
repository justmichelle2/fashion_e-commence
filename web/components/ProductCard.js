"use client"

import { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import Card from '../app/components/ui/Card'
import Badge from '../app/components/ui/Badge'
import Button from '../app/components/ui/Button'
import { useCurrency } from './CurrencyProvider'
import { useLocale } from './LocaleProvider'
import { useWishlist } from './WishlistProvider'

export default function ProductCard({ product = {} }) {
  const { t } = useLocale()
  const { format } = useCurrency()
  const { toggle, isLiked, hydrated } = useWishlist()
  const title = product?.title || t('products.sampleTitle', 'Sample product')
  const baseCurrency = product?.currency || 'USD'
  const priceCents =
    typeof product?.priceCents === 'number'
      ? product.priceCents
      : Math.round(Number(product?.price || 0) * 100)
  const price = format(priceCents, { fromCurrency: baseCurrency })
  const img = product?.image || product?.images?.[0] || '/images/sample1.svg'
  const isLocalAsset = typeof img === 'string' && img.startsWith('/')
  const href = `/product/${product?.id || 'sample'}`
  const category = product?.category || t('products.category', 'Capsule')
  const availability = product?.availability || t('products.availability', 'Made-to-order')
  const productId = product?.id || product?.slug || product?.handle
  const liked = hydrated && productId ? isLiked(productId) : false
  const likeLabel = liked
    ? t('products.removeWishlist', 'Remove from wishlist')
    : t('products.addWishlist', 'Save to wishlist')

  const handleWishlist = useCallback(() => {
    if (!productId) return
    toggle(product)
  }, [productId, toggle, product])

  const likeButtonClasses = useMemo(
    () =>
      `p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-white/40 ${
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200'
          : 'border-card-border text-muted hover:bg-card-hover'
      } ${productId ? '' : 'cursor-not-allowed opacity-60'}`,
    [liked, productId],
  )

  return (
    <Card as="article" className="flex flex-col gap-4">
      <Link href={href} className="relative block w-full overflow-hidden rounded-2xl" aria-label={title}>
        <div className="relative h-72">
          <Image
            src={img}
            alt={title}
            fill
            sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover"
            unoptimized={!isLocalAsset}
            priority={Boolean(product?.isFeatured)}
          />
        </div>
        {product?.tag && (
          <Badge className="absolute left-4 top-4">{product.tag}</Badge>
        )}
      </Link>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{category}</p>
          <h3 className="mt-1 text-lg font-serif leading-tight">{title}</h3>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{price}</span>
          <span className="text-muted">{availability}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={likeButtonClasses}
          aria-label={likeLabel}
          aria-pressed={liked}
          onClick={handleWishlist}
          disabled={!productId}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <div className="flex-1 flex gap-3">
          <Button as={Link} href={href} className="flex-1" size="sm">
            {t('buttons.view', 'View')}
          </Button>
          <Button variant="secondary" className="flex-1" size="sm">
            {t('buttons.addToCart', 'Add to cart')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
