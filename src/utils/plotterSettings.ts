import type { PlotterSettings } from '../types/serial'

export const PLOTTER_SAMPLES_MIN = 100
export const PLOTTER_SAMPLES_MAX = 10_000
export const PLOTTER_SAMPLES_DEFAULT = 500

export const defaultPlotterSettings: PlotterSettings = {
  maxSamples: PLOTTER_SAMPLES_DEFAULT,
  showGrid: true,
  showReferenceLines: true,
  strokeWidth: 2,
  mouseZoom: true,
  inputMode: 'ascii',
  showAreaFill: true,
}

/** @deprecated Use loadAppSettings from appSettings.ts */
export function loadPlotterSettings(): PlotterSettings {
  return defaultPlotterSettings
}

/** @deprecated Use persistFromStore from appSettings.ts */
export function savePlotterSettings() {
  /* handled by serialStore via appSettings */
}

export function clampSamples(n: number) {
  if (!Number.isFinite(n)) return PLOTTER_SAMPLES_DEFAULT
  return Math.min(PLOTTER_SAMPLES_MAX, Math.max(PLOTTER_SAMPLES_MIN, Math.round(n)))
}

export function computeWaveformStats(values: number[]) {
  if (values.length === 0) return null
  let min = values[0]
  let max = values[0]
  let sum = 0
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }
  return { min, max, avg: sum / values.length, count: values.length }
}
