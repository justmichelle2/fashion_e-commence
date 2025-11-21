"use client"

import { useLocale } from './LocaleProvider'
import { TIMELINE_SEQUENCE, normalizeStatusKey } from './orderStatus'

const STAGE_FALLBACKS = {
  requested: {
    label: 'Brief submitted',
    description: 'Client shared inspiration and requirements.',
  },
  quoted: {
    label: 'Quote sent',
    description: 'Designer reviewed and sent pricing.',
  },
  in_progress: {
    label: 'In progress',
    description: 'Sketches, fittings, and chats in motion.',
  },
  in_production: {
    label: 'In production',
    description: 'Atelier is constructing the garment.',
  },
  delivered: {
    label: 'Delivered',
    description: 'Piece arrived with concierge QA.',
  },
  completed: {
    label: 'Completed',
    description: 'Project closed out and archived.',
  },
}

function getStatusIndex(status) {
  const normalized = String(status || '').replace(/-/g, '_').toLowerCase()
  const idx = TIMELINE_SEQUENCE.indexOf(normalized)
  return idx === -1 ? 0 : idx
}

export default function CustomOrderTimeline({ status = 'requested', compact = false }) {
  const { t } = useLocale()
  const activeIndex = getStatusIndex(status)

  return (
    <ol className={`space-y-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      {TIMELINE_SEQUENCE.map((rawKey, index) => {
        const fallback = STAGE_FALLBACKS[rawKey]
        const translationKey = normalizeStatusKey(rawKey)
        const label = t(`orders.timeline.${translationKey}.label`, fallback?.label)
        const description = t(`orders.timeline.${translationKey}.description`, fallback?.description)
        const isCompleted = index < activeIndex
        const isActive = index === activeIndex
        return (
          <li key={rawKey} className="flex items-start gap-3">
            <span
              className={`mt-1 h-3 w-3 rounded-full border ${
                isCompleted ? 'bg-emerald-400 border-emerald-400' : isActive ? 'bg-white border-white' : 'border-muted'
              }`}
            />
            <div className="flex-1">
              <p className={`font-medium ${compact ? 'text-sm' : 'text-base'} ${isActive ? 'text-white' : 'text-muted'}`}>
                {label}
              </p>
              {!compact && <p className="text-xs text-muted/80">{description}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
