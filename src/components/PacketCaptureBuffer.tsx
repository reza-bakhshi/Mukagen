import { useEffect, useMemo, useRef } from 'react'
import { useSerialStore } from '../store/serialStore'
import { filterCaptureEntries } from '../utils/captureFilters'
import { formatBytes } from '../utils/formatBytes'
import { textZoomPx } from '../utils/textZoom'

export function PacketCaptureBuffer() {
  const store = useSerialStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () =>
      filterCaptureEntries(store.captureLog, {
        showTransmitted: store.showTransmitted,
        captureFilterDirection: store.captureFilterDirection,
        captureSearch: store.captureSearch,
        captureHexPattern: store.captureHexPattern,
        captureMinBytes: store.captureMinBytes,
        captureMaxBytes: store.captureMaxBytes,
        captureAsciiOnly: store.captureAsciiOnly,
        viewFormat: store.viewFormat,
      }),
    [
      store.captureLog,
      store.showTransmitted,
      store.captureFilterDirection,
      store.captureSearch,
      store.captureHexPattern,
      store.captureMinBytes,
      store.captureMaxBytes,
      store.captureAsciiOnly,
      store.viewFormat,
    ],
  )

  const lastEntryId = filtered[filtered.length - 1]?.id

  useEffect(() => {
    if (!store.autoScroll) return
    const el = scrollRef.current
    if (!el) return
    const scrollToEnd = () => {
      el.scrollTop = el.scrollHeight
    }
    scrollToEnd()
    requestAnimationFrame(scrollToEnd)
  }, [lastEntryId, store.autoScroll, store.viewFormat, store.stackView, filtered.length])

  if (filtered.length === 0) {
    return (
      <div
        className="flex h-full min-h-[200px] flex-col items-center justify-center p-6 text-center text-sm"
        style={{ color: 'var(--app-text-muted)' }}
      >
        <p className="max-w-md leading-relaxed">
          {store.captureLog.length > 0
            ? 'No lines match the current filters.'
            : 'Capture buffer is empty. Connect from the sidebar to start logging.'}
        </p>
      </div>
    )
  }

  const fontPx = textZoomPx(store.textZoom)

  return (
    <div
      ref={scrollRef}
      className="wb-scrollbar h-full overflow-y-auto font-mono leading-relaxed"
      style={{ fontSize: fontPx }}
    >
      {filtered.map((entry) => {
        const text = formatBytes(entry.raw, store.viewFormat)
        const hexdump = store.viewFormat === 'hexdump'
        const rxColor = 'var(--app-success)'
        const txColor = 'var(--app-warning)'
        const payload = hexdump ? (
          <pre className="whitespace-pre text-xs leading-snug">{text}</pre>
        ) : (
          <span className="whitespace-pre-wrap break-all">{text}</span>
        )
        return store.stackView ? (
          <div
            key={entry.id}
            className="mb-2 overflow-hidden rounded-md p-3"
            style={{
              background: 'var(--app-panel-2)',
              boxShadow: 'inset 0 0 0 1px var(--app-viewport-ring)',
            }}
          >
            <div className="mb-1 flex gap-3 text-xs" style={{ color: 'var(--app-text-muted)' }}>
              <span style={{ color: entry.direction === 'rx' ? rxColor : txColor }}>
                {entry.direction.toUpperCase()}
              </span>
              <span>{formatTime(entry.timestamp)}</span>
              <span>{entry.raw.byteLength} bytes</span>
            </div>
            {payload}
          </div>
        ) : (
          <div key={entry.id} className="wb-capture-entry py-1">
            <span
              className="mr-2 font-semibold"
              style={{ color: entry.direction === 'rx' ? rxColor : txColor }}
            >
              [{entry.direction.toUpperCase()}]
            </span>
            <span style={{ color: 'var(--app-text-muted)' }}>{formatTime(entry.timestamp)}</span>
            {hexdump ? (
              <div className="mt-0.5">{payload}</div>
            ) : (
              <> {payload}</>
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false })
}
