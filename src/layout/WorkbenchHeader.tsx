import { Cable, Moon, Sun, Unplug } from 'lucide-react'
import { AppBrandIcon } from '../components/AppBrandIcon'
import { useSerialStore } from '../store/serialStore'
import type { ThemeMode } from '../types/serial'

export function WorkbenchHeader() {
  const { status, theme, setTheme, appTitle, appIconPreset, appIconCustom } = useSerialStore()
  const connected = status === 'connected'

  return (
    <header
      className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2 wb-header"
      style={{ borderColor: 'var(--app-divider)' }}
    >
      <h1 className="flex items-center gap-2 text-base font-semibold">
        <AppBrandIcon preset={appIconPreset} customUrl={appIconCustom} size={20} />
        {appTitle}
      </h1>

      <div className="flex items-center gap-2">
        <ThemeToggle theme={theme} onChange={setTheme} />
        <span
          className="wb-status-chip"
          style={
            connected
              ? {
                  background: 'color-mix(in srgb, var(--app-success) 18%, transparent)',
                  color: 'var(--app-success)',
                  border: '1px solid color-mix(in srgb, var(--app-success) 40%, transparent)',
                }
              : {
                  background: 'color-mix(in srgb, var(--app-text-muted) 10%, transparent)',
                  color: 'var(--app-text-muted)',
                  border: '1px solid var(--app-border)',
                }
          }
        >
          {connected ? <Cable size={14} /> : <Unplug size={14} />}
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </header>
  )
}

function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemeMode
  onChange: (t: ThemeMode) => void
}) {
  return (
    <div
      className="flex rounded-md border p-0.5"
      style={{ borderColor: 'var(--app-border)', background: 'var(--app-bg)' }}
    >
      <button
        type="button"
        onClick={() => onChange('light')}
        title="Light"
        className="rounded p-1.5"
        style={
          theme === 'light'
            ? { background: 'var(--app-accent)', color: 'var(--app-accent-fg)' }
            : { color: 'var(--app-text-muted)' }
        }
      >
        <Sun size={14} />
      </button>
      <button
        type="button"
        onClick={() => onChange('dark')}
        title="Dark"
        className="rounded p-1.5"
        style={
          theme === 'dark'
            ? { background: 'var(--app-accent)', color: 'var(--app-accent-fg)' }
            : { color: 'var(--app-text-muted)' }
        }
      >
        <Moon size={14} />
      </button>
    </div>
  )
}
