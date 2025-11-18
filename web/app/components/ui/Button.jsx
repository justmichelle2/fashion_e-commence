import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const VARIANTS = {
  primary: 'bg-white text-black hover:bg-neutral-200',
  secondary: 'border border-white/30 text-white hover:bg-white/5',
  ghost: 'text-white/80 hover:text-white hover:bg-white/5',
  muted: 'bg-white/10 text-white hover:bg-white/20',
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
        'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[0.18em] uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
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
