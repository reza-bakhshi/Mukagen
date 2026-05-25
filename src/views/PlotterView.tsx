import { useState } from 'react'
import { LineChart, Play, Settings2, Square, Trash2 } from 'lucide-react'
import { PlotterSettingsPanel } from '../components/PlotterSettingsPanel'
import { SegmentedControl } from '../components/SegmentedControl'
import { WaveformPlot } from '../components/TelemetryChart'
import { useSerialStore } from '../store/serialStore'

export function PlotterView() {
  const [settingsOpen, setSettingsOpen] = useState(true)
  const {
    waveformCapturing,
    waveformValueType,
    setWaveformCapturing,
    setWaveformValueType,
    clearWaveform,
    status,
    pushAlert,
  } = useSerialStore()

  const connected = status === 'connected'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="wb-toolbar-label mr-0.5 flex items-center gap-1.5">
            <LineChart size={14} style={{ color: 'var(--app-accent)' }} />
            Plotter
          </span>

          <SegmentedControl
            value={waveformValueType}
            options={[
              { value: 'float', label: 'Float' },
              { value: 'int', label: 'Int' },
            ]}
            onChange={setWaveformValueType}
            disabled={waveformCapturing}
          />

          {!waveformCapturing ? (
            <button
              type="button"
              className="wb-toolbar-btn wb-toolbar-btn-primary"
              disabled={!connected}
              onClick={() => {
                clearWaveform()
                setWaveformCapturing(true)
                pushAlert('info', 'Plotter recording — send one number per line (RX or TX).')
              }}
              title={connected ? undefined : 'Connect serial port first'}
            >
              <Play size={14} />
              Start
            </button>
          ) : (
            <button
              type="button"
              className="wb-toolbar-btn wb-toolbar-btn-danger"
              onClick={() => setWaveformCapturing(false)}
            >
              <Square size={14} />
              Stop
            </button>
          )}

          <button type="button" className="wb-toolbar-btn" onClick={clearWaveform}>
            <Trash2 size={14} />
            Clear
          </button>

          {waveformCapturing && (
            <span
              className="wb-toolbar-btn pointer-events-none border-transparent bg-transparent"
              style={{ color: 'var(--app-success)' }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              Rec
            </span>
          )}

          <button
            type="button"
            className={`wb-toolbar-btn wb-toolbar-btn-icon ml-auto ${
              settingsOpen ? 'wb-format-active' : ''
            }`}
            onClick={() => setSettingsOpen((o) => !o)}
            title="Chart settings"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 pt-2">
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
          <div className="wb-viewport min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="h-full min-h-0 p-2">
              <WaveformPlot />
            </div>
          </div>
          {settingsOpen && <PlotterSettingsPanel />}
        </div>
      </div>
    </div>
  )
}
