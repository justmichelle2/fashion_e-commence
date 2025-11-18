import Image from 'next/image'

export default function DesignerCard({designer}){
  const name = designer?.name || 'Designer'
  const bio = designer?.bio || 'Contemporary tailoring & elevated basics'
  const img = designer?.avatar || '/images/sample3.svg'
  const isLocalAsset = typeof img === 'string' && img.startsWith('/')

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
          <span className="tag-chip">Ready-to-wear</span>
          <span className="tag-chip">Bespoke</span>
        </div>
      </div>
    </div>
  )
}
