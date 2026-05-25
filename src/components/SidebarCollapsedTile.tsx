import type { ReactNode } from 'react'

/** Fixed 36×36 tile for folded sidebar — connect, status, etc. */
export function SidebarCollapsedTile({
  children,
  title,
  className = '',
  style,
}: {
  children: ReactNode
  title?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      title={title}
      className={`sidebar-collapsed-tile ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  )
}
