import {
  Activity,
  Cable,
  Cpu,
  Monitor,
  Radio,
  Terminal,
  Usb,
  type LucideIcon,
} from 'lucide-react'
import type { AppIconPresetId } from '../config/appBranding'

const PRESET_ICONS: Record<AppIconPresetId, LucideIcon> = {
  terminal: Terminal,
  monitor: Monitor,
  cpu: Cpu,
  usb: Usb,
  radio: Radio,
  activity: Activity,
  cable: Cable,
}

interface AppBrandIconProps {
  preset: AppIconPresetId
  customUrl: string | null
  size?: number
  className?: string
}

export function AppBrandIcon({ preset, customUrl, size = 20, className }: AppBrandIconProps) {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded object-contain ${className ?? ''}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const Icon = PRESET_ICONS[preset] ?? Terminal
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={`shrink-0 ${className ?? ''}`}
      style={{ color: 'var(--app-accent)' }}
      aria-hidden
    />
  )
}
