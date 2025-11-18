import { cn } from '../../lib/cn'

export default function Container({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
