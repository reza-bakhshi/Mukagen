import { Settings } from 'lucide-react'

export function SettingsView() {
  return (
    <div className="wb-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Settings size={18} style={{ color: 'var(--app-accent)' }} />
        Settings
      </h2>

      <div className="wb-panel p-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
          The settings sidebar item has been removed. Capture buffer controls are now available in the Console view.
        </p>
      </div>
    </div>
  )
}
