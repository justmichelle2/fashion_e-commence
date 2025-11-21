import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const VARIANTS = {
  primary:
    'bg-black text-white hover:bg-black/90 border border-transparent dark:bg-gradient-to-r dark:from-[#c9a4ff] dark:to-[#8a5cf7] dark:text-black dark:hover:opacity-95 dark:shadow-[0_8px_22px_rgba(0,0,0,0.35)]',
  secondary:
    'border border-black/20 text-black hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:bg-white/5',
  ghost:
    'text-black/70 hover:text-black hover:bg-black/5 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/5',
  muted:
    'bg-black/10 text-black hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
}

const SIZES = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-sm px-6 py-3',
}

export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    icon: Icon,
    type,
    ...props
  },
  ref,
) {
  const resolvedType = Component === 'button' ? type || 'button' : undefined

  return (
    <Component
      ref={ref}
      type={resolvedType}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[0.18em] uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/60',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Component>
  )
})

export default Button
