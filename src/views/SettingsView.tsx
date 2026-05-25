import { useRef, useState } from 'react'
import { ImagePlus, Save, Settings, X } from 'lucide-react'
import { AppBrandIcon } from '../components/AppBrandIcon'
import {
  APP_ICON_PRESET_LABELS,
  APP_TITLE_MAX_LENGTH,
  DEFAULT_APP_TITLE,
  type AppIconPresetId,
} from '../config/appBranding'
import { useSerialStore } from '../store/serialStore'
import { BUFFER_MAX, BUFFER_MIN } from '../utils/appSettings'

const PRESET_IDS = Object.keys(APP_ICON_PRESET_LABELS) as AppIconPresetId[]
const CUSTOM_ICON_MAX_BYTES = 96 * 1024

type SettingsDraftProps = {
  captureBufferMax: number
  captureLogLength: number
  appTitle: string
  appIconPreset: AppIconPresetId
  appIconCustom: string | null
  setCaptureBufferMax: (max: number) => void
  setAppBranding: (title: string, preset: AppIconPresetId, custom: string | null) => void
  pushAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void
}

function SettingsDraftForm({
  captureBufferMax,
  captureLogLength,
  appTitle,
  appIconPreset,
  appIconCustom,
  setCaptureBufferMax,
  setAppBranding,
  pushAlert,
}: SettingsDraftProps) {
  const [draftBuffer, setDraftBuffer] = useState(captureBufferMax)
  const [draftTitle, setDraftTitle] = useState(appTitle)
  const [draftPreset, setDraftPreset] = useState(appIconPreset)
  const [draftCustom, setDraftCustom] = useState(appIconCustom)
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    setCaptureBufferMax(draftBuffer)
    setAppBranding(draftTitle, draftPreset, draftCustom)
    pushAlert('success', 'Settings saved successfully.')
  }

  const onCustomFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      pushAlert('warning', 'Choose a PNG, JPG, SVG, or WebP image.')
      return
    }
    if (file.size > CUSTOM_ICON_MAX_BYTES) {
      pushAlert('warning', 'Image must be 96 KB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      if (typeof url === 'string') {
        setDraftCustom(url)
        pushAlert('info', 'Custom icon selected — click Save settings to apply.')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-md space-y-4">
        <section className="wb-panel p-4">
          <h3 className="text-sm font-semibold">Header</h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
            Title and icon in the top bar.
          </p>

          <div
            className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: 'var(--app-border)', background: 'var(--app-panel-2)' }}
          >
            <AppBrandIcon preset={draftPreset} customUrl={draftCustom} size={22} />
            <span className="truncate text-sm font-bold">
              {draftTitle.trim() || DEFAULT_APP_TITLE}
            </span>
          </div>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="wb-label font-bold" style={{ color: 'var(--app-text)' }}>
              App name
            </span>
            <input
              type="text"
              value={draftTitle}
              maxLength={APP_TITLE_MAX_LENGTH}
              placeholder={DEFAULT_APP_TITLE}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="wb-select-compact w-full py-2 text-sm"
            />
          </label>

          <div className="mt-4 flex flex-col gap-1.5">
            <span className="wb-label font-bold" style={{ color: 'var(--app-text)' }}>
              Icon
            </span>
            <div className="grid grid-cols-4 gap-1.5">
            {PRESET_IDS.map((id) => (
              <button
                key={id}
                type="button"
                title={APP_ICON_PRESET_LABELS[id]}
                onClick={() => {
                  setDraftPreset(id)
                  setDraftCustom(null)
                }}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition ${
                  draftPreset === id && !draftCustom
                    ? 'wb-format-active'
                    : 'border-transparent hover:border-[var(--app-border)]'
                }`}
                style={
                  draftPreset === id && !draftCustom
                    ? undefined
                    : { borderColor: 'var(--app-border)', background: 'var(--app-bg)' }
                }
              >
                <AppBrandIcon preset={id} customUrl={null} size={18} />
                <span className="text-[9px] font-bold" style={{ color: 'var(--app-text)' }}>
                  {APP_ICON_PRESET_LABELS[id]}
                </span>
              </button>
            ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                onCustomFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <button
              type="button"
              className="wb-toolbar-btn gap-1.5 text-xs"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={14} />
              Upload custom
            </button>
            {draftCustom && (
              <button
                type="button"
                className="wb-toolbar-btn gap-1.5 text-xs"
                onClick={() => setDraftCustom(null)}
              >
                <X size={14} />
                Remove custom
              </button>
            )}
          </div>
        </section>

        <section className="wb-panel p-4">
          <h3 className="text-sm font-semibold">Capture buffer</h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
            Maximum RX/TX lines kept in the console monitor.
          </p>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="wb-label">Buffer size (lines)</span>
            <input
              type="number"
              min={BUFFER_MIN}
              max={BUFFER_MAX}
              step={500}
              value={draftBuffer}
              onChange={(e) => setDraftBuffer(Number(e.target.value))}
              className="wb-select-compact w-full py-2 text-sm"
            />
          </label>

          <p className="mt-2 text-xs" style={{ color: 'var(--app-text-muted)' }}>
            Range {BUFFER_MIN.toLocaleString()}–{BUFFER_MAX.toLocaleString()}. Current log:{' '}
            {captureLogLength.toLocaleString()} lines.
          </p>
        </section>

        <button type="button" onClick={save} className="wb-toolbar-btn wb-toolbar-btn-primary gap-2 px-4">
          <Save size={14} />
          Save settings
        </button>
    </div>
  )
}

export function SettingsView() {
  const {
    captureBufferMax,
    setCaptureBufferMax,
    captureLog,
    appTitle,
    appIconPreset,
    appIconCustom,
    setAppBranding,
    pushAlert,
  } = useSerialStore()

  const draftKey = `${captureBufferMax}|${appTitle}|${appIconPreset}|${appIconCustom ?? ''}`

  return (
    <div className="wb-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Settings size={18} style={{ color: 'var(--app-accent)' }} />
        Settings
      </h2>

      <SettingsDraftForm
        key={draftKey}
        captureBufferMax={captureBufferMax}
        captureLogLength={captureLog.length}
        appTitle={appTitle}
        appIconPreset={appIconPreset}
        appIconCustom={appIconCustom}
        setCaptureBufferMax={setCaptureBufferMax}
        setAppBranding={setAppBranding}
        pushAlert={pushAlert}
      />
    </div>
  )
}
