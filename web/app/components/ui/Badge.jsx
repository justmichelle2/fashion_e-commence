import { cn } from '../../lib/cn'

export function Badge({ variant = 'subtle', className = '', children }) {
  const variants = {
    subtle: 'bg-white/5 text-white border border-white/10',
    accent: 'bg-gradient-to-r from-violet-300 to-rose-200 text-neutral-900',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em]',
        variants[variant] ?? variants.subtle,
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
