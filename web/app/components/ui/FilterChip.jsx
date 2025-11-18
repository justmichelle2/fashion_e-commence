import { cn } from '../../lib/cn'

export default function FilterChip({ active = false, className = '', children, ...props }) {
  return (
    <button
      className={cn(
        'filter-chip transition-colors duration-200',
        active && 'filter-chip--active',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
