"use client"

import Image from 'next/image'
import { useLocale } from './LocaleProvider'

const TAG_KEYS = ['designers.card.tags.readyToWear', 'designers.card.tags.bespoke']

export default function DesignerCard({designer}){
  const { t } = useLocale()
  const name = designer?.name || t('designers.card.placeholderName', 'Designer')
  const bio = designer?.bio || t('designers.card.placeholderBio', 'Contemporary tailoring & elevated basics')
  const img = designer?.avatar || '/images/sample3.svg'
  const isLocalAsset = typeof img === 'string' && img.startsWith('/')
  const defaultTags = TAG_KEYS.map((key, index) => t(key, index === 0 ? 'Ready-to-wear' : 'Bespoke'))
  const tags = Array.isArray(designer?.tags) && designer.tags.length ? designer.tags : defaultTags

  return (
    <div className="card card-hover p-4 flex items-center gap-4">
      <div className="w-20 h-20 rounded-image-frame overflow-hidden flex-shrink-0 relative">
        <Image
          src={img}
          alt={name}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized={!isLocalAsset}
        />
      </div>
      <div>
        <h4 className="font-medium lux-text">{name}</h4>
        <p className="text-sm text-muted">{bio}</p>
        <div className="mt-2 flex gap-2">
          {tags.map((label) => (
            <span key={label} className="tag-chip">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
