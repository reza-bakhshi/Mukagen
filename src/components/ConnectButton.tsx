import { Cable, Unplug } from 'lucide-react'
import type { PortStatus } from '../types/serial'

interface ConnectButtonProps {
  status: PortStatus
  onConnect: () => void
  onDisconnect: () => void
  compact?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
}

export function ConnectButton({
  status,
  onConnect,
  onDisconnect,
  compact,
  fullWidth,
  iconOnly,
}: ConnectButtonProps) {
  const connected = status === 'connected'
  const connecting = status === 'connecting'
  const icon = compact ? 15 : 18

  const layoutCls = fullWidth && !iconOnly ? 'w-full justify-center' : ''
  if (connected) {
    const cls = iconOnly
      ? 'sidebar-collapsed-tile sidebar-collapsed-tile-disconnect'
      : compact
        ? 'wb-btn-disconnect-sm'
        : 'wb-btn-disconnect'
    return (
      <button
        type="button"
        onClick={onDisconnect}
        className={`${cls} ${layoutCls} inline-flex items-center justify-center gap-1.5`}
      >
        <Unplug size={icon} strokeWidth={2} />
        {!iconOnly && 'Disconnect'}
      </button>
    )
  }

  const cls = iconOnly
    ? 'sidebar-collapsed-tile sidebar-collapsed-tile-connect'
    : compact
      ? 'wb-btn-connect-sm'
      : 'wb-btn-connect'

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={connecting}
      className={`${cls} ${layoutCls} inline-flex items-center justify-center gap-1.5`}
      title={iconOnly ? 'Connect' : undefined}
    >
      <Cable size={icon} strokeWidth={2} />
      {!iconOnly && (connecting ? 'Connecting…' : 'Connect')}
    </button>
  )
}
