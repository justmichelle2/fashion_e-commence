"use client"

import Image from 'next/image'
import { Link } from '@/navigation'
import Card from '../app/components/ui/Card'
import Badge from '../app/components/ui/Badge'
import Button from '../app/components/ui/Button'
import { formatPrice } from '../app/lib/price'
import { useLocale } from './LocaleProvider'

export default function ProductCard({ product = {} }){
  const { t } = useLocale()
  const title = product?.title || t('products.sampleTitle', 'Sample product')
  const price = formatPrice(product)
  const img = product?.image || product?.images?.[0] || '/images/sample1.svg'
  const isLocalAsset = typeof img === 'string' && img.startsWith('/')
  const href = `/product/${product?.id || 'sample'}`
  const category = product?.category || t('products.category', 'Capsule')
  const availability = product?.availability || t('products.availability', 'Made-to-order')

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
      <div className="flex gap-3">
        <Button as={Link} href={href} className="flex-1" size="sm">
          {t('buttons.view', 'View')}
        </Button>
        <Button variant="secondary" className="flex-1" size="sm">
          {t('buttons.addToCart', 'Add to cart')}
        </Button>
      </div>
    </Card>
  )
}
