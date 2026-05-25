import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import { useSerialStore } from '../store/serialStore'
import type { AlertType } from '../types/alerts'

const ICONS: Record<AlertType, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
}

const STYLES: Record<AlertType, { border: string; bg: string; color: string }> = {
  error: {
    border: 'var(--app-danger)',
    bg: 'color-mix(in srgb, var(--app-danger) 16%, var(--app-panel))',
    color: 'var(--app-danger)',
  },
  success: {
    border: 'var(--app-success)',
    bg: 'color-mix(in srgb, var(--app-success) 16%, var(--app-panel))',
    color: 'var(--app-success)',
  },
  warning: {
    border: 'var(--app-warning)',
    bg: 'color-mix(in srgb, var(--app-warning) 16%, var(--app-panel))',
    color: 'var(--app-warning)',
  },
  info: {
    border: 'var(--app-accent)',
    bg: 'color-mix(in srgb, var(--app-accent) 16%, var(--app-panel))',
    color: 'var(--app-accent)',
  },
}

export function AlertToasts() {
  const { alerts, dismissAlert } = useSerialStore()

  if (alerts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-14 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4"
      aria-live="polite"
    >
      {alerts.map((alert) => {
          const Icon = ICONS[alert.type]
          const style = STYLES[alert.type]
          return (
            <div
              key={alert.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl"
              style={{
                borderColor: style.border,
                background: style.bg,
                color: 'var(--app-text)',
              }}
              role="alert"
            >
              <Icon size={22} className="shrink-0" style={{ color: style.color }} />
              <p className="flex-1 pt-0.5 text-sm leading-relaxed">{alert.message}</p>
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                className="shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100"
                style={{ background: 'var(--app-panel-2)' }}
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )
      })}
    </div>
  )
}
