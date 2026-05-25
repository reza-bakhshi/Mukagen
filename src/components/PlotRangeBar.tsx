import { useCallback, useRef } from 'react'
import type { WaveformPoint } from '../types/serial'

interface PlotRangeBarProps {
  points: WaveformPoint[]
  startIndex: number
  endIndex: number
  onChange: (start: number, end: number) => void
}

export function PlotRangeBar({ points, startIndex, endIndex, onChange }: PlotRangeBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const max = Math.max(0, points.length - 1)
  const lo = Math.min(startIndex, endIndex)
  const hi = Math.max(startIndex, endIndex)

  const values = points.map((p) => p.value)
  const vMin = Math.min(...values, 0)
  const vMax = Math.max(...values, 1)
  const span = vMax - vMin || 1

  const pct = (i: number) => (max === 0 ? 0 : (i / max) * 100)

  const pickIndex = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || max === 0) return 0
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return Math.round(ratio * max)
    },
    [max],
  )

  const startDrag = (which: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault()
    const move = (ev: PointerEvent) => {
      const idx = pickIndex(ev.clientX)
      if (which === 'start') {
        onChange(Math.min(idx, hi), hi)
      } else {
        onChange(lo, Math.max(idx, lo))
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return
    const idx = pickIndex(e.clientX)
    const distStart = Math.abs(idx - lo)
    const distEnd = Math.abs(idx - hi)
    if (distStart <= distEnd) onChange(Math.min(idx, hi), hi)
    else onChange(lo, Math.max(idx, lo))
  }

  if (points.length < 2) return null

  return (
    <div className="plot-range-root shrink-0 px-1 pt-1">
      <div
        ref={trackRef}
        role="slider"
        aria-label="Plot time range"
        className="plot-range-track"
        onClick={onTrackClick}
      >
        <svg className="plot-range-sparkline" viewBox="0 0 100 24" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--app-chart-grid)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            points={points
              .map((p, i) => {
                const x = max === 0 ? 0 : (i / max) * 100
                const y = 22 - ((p.value - vMin) / span) * 20
                return `${x},${y}`
              })
              .join(' ')}
          />
        </svg>
        <div
          className="plot-range-window"
          style={{
            left: `${pct(lo)}%`,
            width: `${Math.max(2, pct(hi) - pct(lo))}%`,
          }}
        />
        <button
          type="button"
          data-handle="start"
          className="plot-range-handle plot-range-handle-start"
          style={{ left: `${pct(lo)}%` }}
          onPointerDown={startDrag('start')}
          aria-label="Range start"
        />
        <button
          type="button"
          data-handle="end"
          className="plot-range-handle plot-range-handle-end"
          style={{ left: `${pct(hi)}%` }}
          onPointerDown={startDrag('end')}
          aria-label="Range end"
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px]" style={{ color: 'var(--app-text-muted)' }}>
        <span>
          {lo} → {hi}
        </span>
        <span>{hi - lo + 1} samples</span>
      </div>
    </div>
  )
}
