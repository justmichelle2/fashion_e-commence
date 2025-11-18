const STAGES = [
  {
    key: 'requested',
    label: 'Brief submitted',
    description: 'Client shared inspiration and requirements.',
  },
  {
    key: 'quoted',
    label: 'Quote sent',
    description: 'Designer reviewed and sent pricing.',
  },
  {
    key: 'in_progress',
    label: 'In progress',
    description: 'Sketches, fittings, and chats in motion.',
  },
  {
    key: 'in_production',
    label: 'In production',
    description: 'Atelier is constructing the garment.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Piece arrived with concierge QA.',
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Project closed out and archived.',
  },
]

const STATUS_PRIORITY = STAGES.map((stage) => stage.key)

function getStatusIndex(status) {
  const idx = STATUS_PRIORITY.indexOf(status)
  return idx === -1 ? 0 : idx
}

export default function CustomOrderTimeline({ status = 'requested', compact = false }) {
  const activeIndex = getStatusIndex(status)

  return (
    <ol className={`space-y-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      {STAGES.map((stage, index) => {
        const isCompleted = index < activeIndex
        const isActive = index === activeIndex
        return (
          <li key={stage.key} className="flex items-start gap-3">
            <span
              className={`mt-1 h-3 w-3 rounded-full border ${
                isCompleted ? 'bg-emerald-400 border-emerald-400' : isActive ? 'bg-white border-white' : 'border-muted'
              }`}
            />
            <div className="flex-1">
              <p className={`font-medium ${compact ? 'text-sm' : 'text-base'} ${isActive ? 'text-white' : 'text-muted'}`}>
                {stage.label}
              </p>
              {!compact && <p className="text-xs text-muted/80">{stage.description}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
