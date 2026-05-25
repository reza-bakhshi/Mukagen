import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ZoomIn, ZoomOut } from 'lucide-react'
import { useSerialStore } from '../store/serialStore'
import {
  TEXT_ZOOM_MAX,
  TEXT_ZOOM_MIN,
  TEXT_ZOOM_PRESETS,
  textZoomIn,
  textZoomLabel,
  textZoomOut,
} from '../utils/textZoom'

export function TextZoomButtons() {
  const textZoom = useSerialStore((s) => s.textZoom)
  const setTextZoom = useSerialStore((s) => s.setTextZoom)
  const [panelOpen, setPanelOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!panelOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanelOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [panelOpen])

  return (
    <span ref={rootRef} className="relative inline-flex items-center gap-0.5">
      <button
        type="button"
        className="wb-toolbar-btn wb-toolbar-btn-icon"
        onClick={() => setTextZoom(textZoomOut(textZoom))}
        disabled={textZoom <= TEXT_ZOOM_MIN}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut size={14} />
      </button>

      <button
        type="button"
        className="wb-toolbar-btn inline-flex min-w-[3.25rem] items-center justify-center gap-0.5 px-1.5 font-mono text-[0.75rem] tabular-nums"
        onClick={() => setPanelOpen((o) => !o)}
        aria-expanded={panelOpen}
        aria-haspopup="listbox"
        title="Text zoom presets"
      >
        {textZoomLabel(textZoom)}
        <ChevronDown size={12} className={panelOpen ? 'rotate-180' : ''} />
      </button>

      {panelOpen && (
        <div
          className="wb-zoom-panel absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2"
          role="listbox"
          aria-label="Zoom level"
        >
          {TEXT_ZOOM_PRESETS.map((preset) => {
            const active = Math.abs(textZoom - preset) < 0.001
            return (
              <button
                key={preset}
                type="button"
                role="option"
                aria-selected={active}
                className={`wb-zoom-preset ${active ? 'wb-zoom-preset-active' : ''}`}
                onClick={() => {
                  setTextZoom(preset)
                  setPanelOpen(false)
                }}
              >
                {Math.round(preset * 100)}%
              </button>
            )
          })}
        </div>
      )}

      <button
        type="button"
        className="wb-toolbar-btn wb-toolbar-btn-icon"
        onClick={() => setTextZoom(textZoomIn(textZoom))}
        disabled={textZoom >= TEXT_ZOOM_MAX}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
    </span>
  )
}
