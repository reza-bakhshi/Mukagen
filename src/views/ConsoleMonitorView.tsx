import { useState, type ComponentType } from 'react'
import {
  Binary,
  ChevronDown,
  ChevronRight,
  Download,
  Eraser,
  FileJson,
  Layers,
  Search,
  SlidersHorizontal,
  Type,
} from 'lucide-react'
import { HexdumpIcon } from '../components/HexdumpIcon'
import { HexIcon } from '../components/HexIcon'
import { SegmentedControl } from '../components/SegmentedControl'
import { ToggleChip } from '../components/ToggleChip'
import { PacketCaptureBuffer } from '../components/PacketCaptureBuffer'
import { TextZoomButtons } from '../components/TextZoomButtons'
import { UartTxPanel } from '../components/UartTxPanel'
import { useSerialStore } from '../store/serialStore'
import type { ViewFormat } from '../types/serial'
import { hasActiveCaptureFilters } from '../utils/captureFilters'
import { exportCaptureLog } from '../utils/exportLogs'

interface ConsoleMonitorViewProps {
  onTransmit: (data: Uint8Array) => void
  connected: boolean
}

const FORMATS: { id: ViewFormat; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'ascii', label: 'ASCII', icon: Type },
  { id: 'binary', label: 'Bin', icon: Binary },
  { id: 'hex', label: 'Hex', icon: HexIcon },
  { id: 'hexdump', label: 'Hexdump', icon: HexdumpIcon },
]

export function ConsoleMonitorView({ onTransmit, connected }: ConsoleMonitorViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const store = useSerialStore()

  const filterActive = hasActiveCaptureFilters(
    {
      showTransmitted: store.showTransmitted,
      captureFilterDirection: store.captureFilterDirection,
      captureSearch: store.captureSearch,
      captureHexPattern: store.captureHexPattern,
      captureMinBytes: store.captureMinBytes,
      captureMaxBytes: store.captureMaxBytes,
      captureAsciiOnly: store.captureAsciiOnly,
      viewFormat: store.viewFormat,
    },
    store.autoScroll,
    store.stackView,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {FORMATS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => store.setViewFormat(id)}
              className={`wb-toolbar-btn ${store.viewFormat === id ? 'wb-format-active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          <button
            type="button"
            className="wb-toolbar-btn"
            onClick={() => exportCaptureLog(store.captureLog, 'csv', store.viewFormat)}
          >
            <Download size={14} />
            CSV
          </button>
          <button
            type="button"
            className="wb-toolbar-btn"
            onClick={() => exportCaptureLog(store.captureLog, 'json', store.viewFormat)}
          >
            <FileJson size={14} />
            JSON
          </button>
          <button
            type="button"
            onClick={() => store.setStackView(!store.stackView)}
            className={`wb-toolbar-btn ${store.stackView ? 'wb-format-active' : ''}`}
          >
            <Layers size={14} />
            Stack
          </button>
          <button
            type="button"
            className="wb-toolbar-btn"
            onClick={() => store.clearCapture()}
          >
            <Eraser size={14} />
            Clear
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`wb-toolbar-btn ${
              filtersOpen || filterActive ? 'wb-format-active' : ''
            }`}
          >
            {filtersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <TextZoomButtons />
        </div>

        {filtersOpen && (
          <div className="wb-filters-compact mt-1.5 flex flex-col gap-1.5">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-1.5">
              <label className="relative flex min-w-0 items-center">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--app-text-muted)' }}
                />
                <input
                  type="search"
                  value={store.captureSearch}
                  onChange={(e) => store.setCaptureSearch(e.target.value)}
                  placeholder="Search text or hex…"
                  className="wb-select-compact wb-filter-input w-full min-w-0 pl-7 font-sans text-xs"
                />
              </label>

              <input
                type="text"
                value={store.captureHexPattern}
                onChange={(e) => store.setCaptureHexPattern(e.target.value)}
                placeholder="Hex aa55"
                title="Hex pattern (no spaces)"
                className="wb-select-compact wb-filter-input min-w-0 w-full font-mono text-xs"
              />

              <div className="shrink-0" title="Direction">
                <SegmentedControl
                  value={store.captureFilterDirection}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'rx', label: 'RX' },
                    { value: 'tx', label: 'TX' },
                  ]}
                  onChange={store.setCaptureFilterDirection}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="number"
                min={0}
                placeholder="Min B"
                title="Minimum bytes"
                value={store.captureMinBytes ?? ''}
                onChange={(e) =>
                  store.setCaptureMinBytes(e.target.value ? Number(e.target.value) : null)
                }
                className="wb-select-compact wb-filter-input w-[4.25rem] text-xs"
              />
              <input
                type="number"
                min={0}
                placeholder="Max B"
                title="Maximum bytes"
                value={store.captureMaxBytes ?? ''}
                onChange={(e) =>
                  store.setCaptureMaxBytes(e.target.value ? Number(e.target.value) : null)
                }
                className="wb-select-compact wb-filter-input w-[4.25rem] text-xs"
              />
              <ToggleChip
                label="TX"
                checked={store.showTransmitted}
                onChange={store.setShowTransmitted}
              />
              <ToggleChip label="Scroll" checked={store.autoScroll} onChange={store.setAutoScroll} />
              <ToggleChip
                label="ASCII"
                checked={store.captureAsciiOnly}
                onChange={store.setCaptureAsciiOnly}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 pt-2">
        <div className="wb-viewport flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="wb-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
            <PacketCaptureBuffer />
          </div>
        </div>

        <UartTxPanel onTransmit={onTransmit} disabled={!connected} />
      </div>
    </div>
  )
}
