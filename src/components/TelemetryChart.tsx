import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PlotRangeBar } from './PlotRangeBar'
import { useSerialStore } from '../store/serialStore'
import { computeWaveformStats } from '../utils/plotterSettings'

type ViewRange = { startIndex: number; endIndex: number }

export function WaveformPlot() {
  const points = useSerialStore((s) => s.waveformPoints)
  const plotterSettings = useSerialStore((s) => s.plotterSettings)
  const chartWrapRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })
  const [viewRange, setViewRange] = useState<ViewRange | null>(null)

  useEffect(() => {
    const el = chartWrapRef.current
    if (!el) return

    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      setChartSize({
        width: Math.floor(width),
        height: Math.floor(height),
      })
    }

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [points.length])

  const indices = useMemo(() => {
    if (points.length === 0) return { start: 0, end: 0 }
    const start = viewRange?.startIndex ?? 0
    const end = viewRange?.endIndex ?? points.length - 1
    return {
      start: Math.max(0, Math.min(start, points.length - 1)),
      end: Math.max(0, Math.min(end, points.length - 1)),
    }
  }, [points.length, viewRange])

  const chartData = useMemo(
    () => points.map((p, i) => ({ i, value: p.value })),
    [points],
  )

  const visiblePoints = useMemo(() => {
    if (chartData.length === 0) return []
    const lo = Math.min(indices.start, indices.end)
    const hi = Math.max(indices.start, indices.end)
    return chartData.slice(lo, hi + 1)
  }, [chartData, indices])

  const stats = useMemo(
    () => computeWaveformStats(visiblePoints.map((p) => p.value)),
    [visiblePoints],
  )

  const setRange = useCallback((startIndex: number, endIndex: number) => {
    setViewRange({ startIndex, endIndex })
  }, [])

  const applyIndexZoom = useCallback((zoomIn: boolean) => {
    if (points.length < 2) return
    const fullStart = 0
    const fullEnd = points.length - 1
    setViewRange((prev) => {
      const curStart = prev?.startIndex ?? fullStart
      const curEnd = prev?.endIndex ?? fullEnd
      const span = Math.max(1, curEnd - curStart)
      const center = (curStart + curEnd) / 2
      let newSpan = zoomIn ? span * 0.8 : span * 1.2
      newSpan = Math.max(4, Math.min(newSpan, fullEnd - fullStart))
      if (newSpan >= fullEnd - fullStart) return null
      let start = Math.round(center - newSpan / 2)
      let end = Math.round(center + newSpan / 2)
      if (start < fullStart) {
        end += fullStart - start
        start = fullStart
      }
      if (end > fullEnd) {
        start -= end - fullEnd
        end = fullEnd
      }
      return {
        startIndex: Math.max(fullStart, start),
        endIndex: Math.min(fullEnd, end),
      }
    })
  }, [points.length])

  const applyWheelZoom = useCallback(
    (deltaY: number) => {
      if (!plotterSettings.mouseZoom || points.length < 2) return
      applyIndexZoom(deltaY < 0)
    },
    [applyIndexZoom, plotterSettings.mouseZoom, points.length],
  )

  useEffect(() => {
    const el = chartWrapRef.current
    if (!el || !plotterSettings.mouseZoom) return
    const onWheel = (e: WheelEvent) => {
      if (points.length < 2) return
      e.preventDefault()
      applyWheelZoom(e.deltaY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyWheelZoom, plotterSettings.mouseZoom, points.length])

  const chartReady = chartSize.width > 0 && chartSize.height > 0
  const brushStart = indices.start
  const brushEnd = indices.end

  if (points.length === 0) {
    return (
      <div
        ref={chartWrapRef}
        className="flex h-full min-h-[12rem] w-full items-center justify-center p-8 text-center text-sm"
        style={{ color: 'var(--app-text-muted)' }}
      >
        Press <strong>Start</strong> on Plotter, then send numbers (one per line) on serial RX or from
        Shell/Console TX.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[12rem] min-w-0">
      {stats && (
        <div
          className="flex shrink-0 flex-col justify-center gap-1.5 border-r py-2 pl-1 pr-2"
          style={{ borderColor: 'var(--app-divider)' }}
        >
          <StatRow label="Min" value={formatNum(stats.min)} tone="success" />
          <StatRow label="Avg" value={formatNum(stats.avg)} tone="warning" />
          <StatRow label="Max" value={formatNum(stats.max)} tone="danger" />
          <p
            className="text-right font-mono text-[9px] tabular-nums leading-none"
            style={{ color: 'var(--app-text-muted)' }}
          >
            {stats.count}
          </p>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          ref={chartWrapRef}
          className="relative min-h-0 min-w-0 flex-1"
          onDoubleClick={() => setViewRange(null)}
          title={
            plotterSettings.mouseZoom
              ? 'Scroll to zoom · drag range bar below · double-click chart to reset'
              : undefined
          }
        >
          {chartReady ? (
            <ComposedChart
              width={chartSize.width}
              height={chartSize.height}
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="plot-area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.42} />
                  <stop offset="55%" stopColor="var(--app-accent)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              {plotterSettings.showGrid && (
                <CartesianGrid stroke="var(--app-chart-grid)" strokeDasharray="3 6" />
              )}
              <XAxis
                dataKey="i"
                allowDataOverflow
                domain={[indices.start, indices.end]}
                type="number"
                axisLine={{ stroke: 'var(--app-chart-axis)', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
              />
              <YAxis
                axisLine={{ stroke: 'var(--app-chart-axis)', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
                width={48}
              />
              <Tooltip content={<PlotTooltip />} />
              {plotterSettings.showReferenceLines && stats && (
                <>
                  <ReferenceLine
                    y={stats.avg}
                    stroke="var(--app-ref-avg)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.85}
                  />
                  <ReferenceLine
                    y={stats.min}
                    stroke="var(--app-ref-min)"
                    strokeDasharray="2 2"
                    strokeOpacity={0.85}
                  />
                  <ReferenceLine
                    y={stats.max}
                    stroke="var(--app-ref-max)"
                    strokeDasharray="2 2"
                    strokeOpacity={0.85}
                  />
                </>
              )}
              {plotterSettings.showAreaFill && (
                <Area
                  type="monotone"
                  dataKey="value"
                  fill="url(#plot-area-fill)"
                  stroke="none"
                  isAnimationActive={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--app-accent)"
                strokeWidth={plotterSettings.strokeWidth}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          ) : null}
        </div>

        {points.length > 8 && (
          <PlotRangeBar
            points={points}
            startIndex={brushStart}
            endIndex={brushEnd}
            onChange={setRange}
          />
        )}
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'danger'
}) {
  const colors = {
    success: 'var(--app-success)',
    warning: 'var(--app-warning)',
    danger: 'var(--app-danger)',
  }
  return (
    <div className="wb-plot-stat leading-tight">
      <p
        className="text-[9px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--app-text-muted)' }}
      >
        {label}
      </p>
      <p
        className="font-mono text-[11px] font-semibold tabular-nums"
        style={{ color: colors[tone] }}
      >
        {value}
      </p>
    </div>
  )
}

function formatNum(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function PlotTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  if (value == null) return null
  return (
    <div
      className="rounded-lg px-2.5 py-1.5 font-mono text-xs shadow-sm"
      style={{
        background: 'var(--app-panel)',
        border: '1px solid var(--app-divider)',
        color: 'var(--app-text)',
      }}
    >
      <span style={{ color: 'var(--app-text-muted)' }}>{label ?? '—'}</span>
      <span className="mx-1.5" style={{ color: 'var(--app-divider)' }}>
        ·
      </span>
      <span style={{ color: 'var(--app-accent)' }}>{formatNum(value)}</span>
    </div>
  )
}
