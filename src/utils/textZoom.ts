export const TEXT_ZOOM_MIN = 0.6
export const TEXT_ZOOM_MAX = 2
export const TEXT_ZOOM_STEP = 0.1
export const TEXT_ZOOM_BASE_PX = 14
export const TEXT_ZOOM_DEFAULT = 1

/** Presets shown in the zoom panel (includes 60% and 70%). */
export const TEXT_ZOOM_PRESETS = [
  0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2,
] as const

export function clampTextZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return TEXT_ZOOM_DEFAULT
  const step = Math.round(zoom / TEXT_ZOOM_STEP) * TEXT_ZOOM_STEP
  return Math.min(TEXT_ZOOM_MAX, Math.max(TEXT_ZOOM_MIN, step))
}

export function textZoomIn(zoom: number): number {
  return clampTextZoom(zoom + TEXT_ZOOM_STEP)
}

export function textZoomOut(zoom: number): number {
  return clampTextZoom(zoom - TEXT_ZOOM_STEP)
}

export function textZoomPx(zoom: number): number {
  return Math.round(TEXT_ZOOM_BASE_PX * clampTextZoom(zoom))
}

export function textZoomLabel(zoom: number): string {
  return `${Math.round(clampTextZoom(zoom) * 100)}%`
}
