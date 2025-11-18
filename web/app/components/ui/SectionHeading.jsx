import Container from './Container'
import { cn } from '../../lib/cn'

const JUSTIFY_CLASSES = {
  between: 'md:justify-between',
  start: 'md:justify-start',
  center: 'md:justify-center',
  end: 'md:justify-end',
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  justify = 'between',
  className = '',
}) {
  return (
    <Container
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center',
        JUSTIFY_CLASSES[justify] ?? JUSTIFY_CLASSES.between,
        className,
      )}
    >
      <div className="flex-1 space-y-2">
        {eyebrow && (
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-muted">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-serif leading-tight text-balance">{title}</h2>
        {description && (
          <p className="text-base text-muted max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="mt-2 md:mt-0">{action}</div>}
    </Container>
  )
}
