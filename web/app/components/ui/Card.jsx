import { cn } from '../../lib/cn'

const VARIANTS = {
  glass: 'bg-white/5 border border-white/10 backdrop-blur-md',
  solid: 'bg-neutral-950/80 border border-white/10',
  outline: 'border border-white/20',
}

export function Card({ as: Component = 'div', variant = 'glass', className = '', children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-3xl p-6 transition-shadow duration-200 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)]',
        VARIANTS[variant] ?? VARIANTS.glass,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Card
