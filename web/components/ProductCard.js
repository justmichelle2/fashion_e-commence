"use client"
import Image from 'next/image'
import Link from 'next/link'

export default function ProductCard({product}){
  const title = product?.title || 'Sample product'
  const basePrice = typeof product?.price === 'number'
    ? product.price
    : typeof product?.priceCents === 'number'
      ? product.priceCents / 100
      : 199
  const price = `${product?.currency === 'USD' ? '$' : product?.currency ? `${product.currency} ` : '$'}${basePrice.toFixed(2)}`
  const img = product?.image || product?.images?.[0] || '/images/sample1.svg'
  const isLocalAsset = typeof img === 'string' && img.startsWith('/')

  return (
    <article className="card card-hover shadow-soft fade-in">
      <Link href={`/product/${product?.id || 1}`} className="block">
        <div className="w-full h-64 card-media overflow-hidden relative">
          <Image
            src={img}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            unoptimized={!isLocalAsset}
            priority={Boolean(product?.isFeatured)}
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium lux-text">{title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{price}</span>
            <span className="text-xs text-muted">In stock</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
