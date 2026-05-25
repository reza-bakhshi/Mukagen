import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eraser,
  RotateCcw,
  SlidersHorizontal,
  Terminal,
  Type,
} from 'lucide-react'
import type { RefObject } from 'react'
import { HexIcon } from '../components/HexIcon'
import { SegmentedControl } from '../components/SegmentedControl'
import {
  SerialTerminal,
  type SerialTerminalHandle,
} from '../components/SerialTerminal'
import { TextZoomButtons } from '../components/TextZoomButtons'
import { useSerialStore } from '../store/serialStore'
import {
  SHELL_PANEL_MAX_H,
  SHELL_PANEL_MAX_W,
  SHELL_PANEL_MIN_H,
  SHELL_PANEL_MIN_W,
  clampShellPanelHeight,
  clampShellPanelWidth,
} from '../utils/appSettings'

interface InteractiveShellViewProps {
  terminalRef: RefObject<SerialTerminalHandle | null>
  onUserInput: (data: Uint8Array) => void
  connected: boolean
}

/** Ctrl+C then common shell recovery commands */
const SHELL_RESET_BYTES = new TextEncoder().encode('\x03\r\nreset\r\nstty sane\r\n')

export function InteractiveShellView({
  terminalRef,
  onUserInput,
  connected,
}: InteractiveShellViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const shellAreaRef = useRef<HTMLDivElement>(null)
  const shellHostRef = useRef<HTMLDivElement>(null)
  const skipResizeSyncRef = useRef(false)
  const store = useSerialStore()
  const { shellPanelWidth, shellPanelHeight, setShellPanelSize } = store
  const [draftW, setDraftW] = useState('')
  const [draftH, setDraftH] = useState('')

  const applyShellSize = useCallback(
    (width: number, height: number) => {
      const w = clampShellPanelWidth(width)
      const h = clampShellPanelHeight(height)
      if (w <= 0 || h <= 0) return
      skipResizeSyncRef.current = true
      setShellPanelSize(w, h)
      requestAnimationFrame(() => {
        skipResizeSyncRef.current = false
      })
    },
    [setShellPanelSize],
  )

  useEffect(() => {
    setDraftW(shellPanelWidth > 0 ? String(shellPanelWidth) : '')
    setDraftH(shellPanelHeight > 0 ? String(shellPanelHeight) : '')
  }, [shellPanelWidth, shellPanelHeight])

  useEffect(() => {
    const area = shellAreaRef.current
    if (!area) return
    if (shellPanelWidth > 0 && shellPanelHeight > 0) return
    applyShellSize(area.clientWidth, area.clientHeight)
  }, [shellPanelWidth, shellPanelHeight, applyShellSize])

  useEffect(() => {
    const shell = shellHostRef.current
    if (!shell || shellPanelWidth <= 0 || shellPanelHeight <= 0) return
    shell.style.width = `${shellPanelWidth}px`
    shell.style.height = `${shellPanelHeight}px`
  }, [shellPanelWidth, shellPanelHeight])

  useEffect(() => {
    const shell = shellHostRef.current
    if (!shell) return
    const ro = new ResizeObserver(() => {
      if (skipResizeSyncRef.current) return
      const w = Math.round(shell.offsetWidth)
      const h = Math.round(shell.offsetHeight)
      const current = useSerialStore.getState()
      if (w === current.shellPanelWidth && h === current.shellPanelHeight) return
      if (w < SHELL_PANEL_MIN_W || h < SHELL_PANEL_MIN_H) return
      setShellPanelSize(w, h)
    })
    ro.observe(shell)
    return () => ro.disconnect()
  }, [setShellPanelSize])

  const commitDraftSize = useCallback(() => {
    const w = Number(draftW)
    const h = Number(draftH)
    if (!Number.isFinite(w) || !Number.isFinite(h)) {
      setDraftW(shellPanelWidth > 0 ? String(shellPanelWidth) : '')
      setDraftH(shellPanelHeight > 0 ? String(shellPanelHeight) : '')
      return
    }
    applyShellSize(w, h)
  }, [draftW, draftH, applyShellSize, shellPanelWidth, shellPanelHeight])

  const resetShellPanelSize = useCallback(() => {
    const area = shellAreaRef.current
    if (!area) return
    applyShellSize(area.clientWidth, area.clientHeight)
  }, [applyShellSize])

  const filterActive = Boolean(store.shellReceiveFilter.trim())

  const resetShell = () => {
    terminalRef.current?.resetDisplay()
    if (connected) {
      onUserInput(SHELL_RESET_BYTES)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="wb-toolbar-label mr-0.5 flex items-center gap-1.5">
            <Terminal size={14} style={{ color: 'var(--app-accent)' }} />
            Shell
          </span>
          <div className="shell-size-group">
            <div className="shell-size-box" title="Shell panel size in pixels (drag corner or edit)">
              <span className="shell-size-title">Size</span>
              <label className="shell-size-field">
                X
                <input
                  type="number"
                  min={SHELL_PANEL_MIN_W}
                  max={SHELL_PANEL_MAX_W}
                  value={draftW}
                  onChange={(e) => setDraftW(e.target.value)}
                  onBlur={commitDraftSize}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitDraftSize()
                    }
                  }}
                  className="shell-size-input tabular-nums"
                />
              </label>
              <label className="shell-size-field">
                Y
                <input
                  type="number"
                  min={SHELL_PANEL_MIN_H}
                  max={SHELL_PANEL_MAX_H}
                  value={draftH}
                  onChange={(e) => setDraftH(e.target.value)}
                  onBlur={commitDraftSize}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitDraftSize()
                    }
                  }}
                  className="shell-size-input tabular-nums"
                />
              </label>
              <span className="shell-size-unit">px</span>
            </div>
            <button
              type="button"
              className="wb-toolbar-btn wb-toolbar-btn-icon"
              onClick={resetShellPanelSize}
              title="Reset size to fill available area"
              aria-label="Reset shell size"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => store.setShellDisplayHex(false)}
            className={`wb-toolbar-btn ${!store.shellDisplayHex ? 'wb-format-active' : ''}`}
          >
            <Type size={14} />
            Text
          </button>
          <button
            type="button"
            onClick={() => store.setShellDisplayHex(true)}
            className={`wb-toolbar-btn ${store.shellDisplayHex ? 'wb-format-active' : ''}`}
          >
            <HexIcon size={14} />
            Hex
          </button>
          <SegmentedControl
            value={store.txLineEnding}
            options={[
              { value: 'lf', label: 'LF' },
              { value: 'cr', label: 'CR' },
              { value: 'crlf', label: 'CRLF' },
            ]}
            onChange={store.setTxLineEnding}
          />
          <button type="button" className="wb-toolbar-btn" onClick={() => terminalRef.current?.clear()}>
            <Eraser size={14} />
            Clear
          </button>
          <button
            type="button"
            className="wb-toolbar-btn"
            onClick={resetShell}
            title="Reset terminal display and send Ctrl+C, reset, stty sane to device"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`wb-toolbar-btn ${filtersOpen || filterActive ? 'wb-format-active' : ''}`}
          >
            {filtersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <TextZoomButtons />
        </div>

        {filtersOpen && (
          <div className="mt-1.5">
            <input
              type="search"
              value={store.shellReceiveFilter}
              onChange={(e) => store.setShellReceiveFilter(e.target.value)}
              placeholder="Filter received data…"
              title="Receive filter"
              className="wb-select-compact wb-filter-input w-full text-xs"
            />
          </div>
        )}
      </div>
      <div ref={shellAreaRef} className="shell-area min-h-0 flex-1 overflow-auto p-3 pt-2">
        <div ref={shellHostRef} className="shell-host shell-resizable wb-viewport overflow-hidden">
          <div className="h-full min-h-0 p-2">
            <SerialTerminal ref={terminalRef} onUserInput={onUserInput} disabled={!connected} />
          </div>
        </div>
      </div>
    </div>
  )
}
