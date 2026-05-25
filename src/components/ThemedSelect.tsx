import type { SelectHTMLAttributes } from 'react'

type ThemedSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  compact?: boolean
}

export function ThemedSelect({ compact, className = '', children, ...props }: ThemedSelectProps) {
  const base = compact ? 'wb-select-compact' : 'wb-select'
  return (
    <select className={`${base} ${className}`.trim()} {...props}>
      {children}
    </select>
  )
}
