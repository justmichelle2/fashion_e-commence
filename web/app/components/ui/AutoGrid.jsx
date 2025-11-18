import { cn } from '../../lib/cn'

export default function AutoGrid({
  className = '',
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  as: Component = 'div',
  children,
}) {
  return (
    <Component className={cn('grid gap-6', cols, className)}>
      {children}
    </Component>
  )
}
