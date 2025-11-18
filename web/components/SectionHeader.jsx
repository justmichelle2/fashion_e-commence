export default function SectionHeader({title, subtitle, action}){
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-serif lux-text">{title}</h3>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
