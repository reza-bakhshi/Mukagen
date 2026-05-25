import type { PlotterSettings, ThemeMode, WaveformValueType } from '../types/serial'
import {
  PLOTTER_SAMPLES_DEFAULT,
  clampSamples,
  defaultPlotterSettings,
} from './plotterSettings'
import { TEXT_ZOOM_DEFAULT, clampTextZoom } from './textZoom'

export const SETTINGS_FILE_KEY = 'serial-terminal-settings.json'
const LEGACY_PLOTTER_KEY = 'serial-terminal-plotter-settings'
const LEGACY_BUFFER_KEY = 'serial-terminal-capture-buffer-max'

export const APP_SETTINGS_VERSION = 1

export interface AppSettingsFile {
  version: typeof APP_SETTINGS_VERSION
  theme: ThemeMode
  captureBufferMax: number
  waveformValueType: WaveformValueType
  textZoom: number
  plotter: PlotterSettings
  txFileLineDelayMs: number
  shellPanelWidth: number
  shellPanelHeight: number
}

export const TX_FILE_LINE_DELAY_MIN = 0
export const TX_FILE_LINE_DELAY_MAX = 60_000
export const TX_FILE_LINE_DELAY_DEFAULT = 50

export function clampTxFileLineDelayMs(ms: number): number {
  if (!Number.isFinite(ms)) return TX_FILE_LINE_DELAY_DEFAULT
  return Math.min(TX_FILE_LINE_DELAY_MAX, Math.max(TX_FILE_LINE_DELAY_MIN, Math.round(ms)))
}

export const SHELL_PANEL_MIN_W = 280
export const SHELL_PANEL_MIN_H = 160
export const SHELL_PANEL_MAX_W = 8000
export const SHELL_PANEL_MAX_H = 8000

export function clampShellPanelWidth(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 0
  return Math.min(SHELL_PANEL_MAX_W, Math.max(SHELL_PANEL_MIN_W, Math.round(px)))
}

export function clampShellPanelHeight(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 0
  return Math.min(SHELL_PANEL_MAX_H, Math.max(SHELL_PANEL_MIN_H, Math.round(px)))
}

const BUFFER_MIN = 500
const BUFFER_MAX = 50_000
const BUFFER_DEFAULT = 8000

export const defaultAppSettings: AppSettingsFile = {
  version: APP_SETTINGS_VERSION,
  theme: 'dark',
  captureBufferMax: BUFFER_DEFAULT,
  waveformValueType: 'float',
  textZoom: TEXT_ZOOM_DEFAULT,
  plotter: defaultPlotterSettings,
  txFileLineDelayMs: TX_FILE_LINE_DELAY_DEFAULT,
  shellPanelWidth: 0,
  shellPanelHeight: 0,
}

function clampBufferMax(n: number) {
  if (!Number.isFinite(n)) return BUFFER_DEFAULT
  return Math.min(BUFFER_MAX, Math.max(BUFFER_MIN, Math.round(n)))
}

function normalizePlotter(raw: Partial<PlotterSettings> | undefined): PlotterSettings {
  const d = defaultPlotterSettings
  return {
    maxSamples: clampSamples(raw?.maxSamples ?? d.maxSamples),
    showGrid: raw?.showGrid ?? d.showGrid,
    showReferenceLines: raw?.showReferenceLines ?? d.showReferenceLines,
    strokeWidth:
      raw?.strokeWidth === 1 || raw?.strokeWidth === 2 || raw?.strokeWidth === 3
        ? raw.strokeWidth
        : d.strokeWidth,
    mouseZoom: raw?.mouseZoom ?? d.mouseZoom,
    inputMode: raw?.inputMode === 'raw' ? 'raw' : 'ascii',
    showAreaFill: raw?.showAreaFill ?? d.showAreaFill,
  }
}

function migrateLegacy(): Partial<AppSettingsFile> | null {
  const out: Partial<AppSettingsFile> = {}
  try {
    const plotterRaw = localStorage.getItem(LEGACY_PLOTTER_KEY)
    if (plotterRaw) {
      out.plotter = normalizePlotter(JSON.parse(plotterRaw) as Partial<PlotterSettings>)
    }
    const bufRaw = localStorage.getItem(LEGACY_BUFFER_KEY)
    if (bufRaw) {
      const n = Number(bufRaw)
      if (Number.isFinite(n)) out.captureBufferMax = clampBufferMax(n)
    }
  } catch {
    /* ignore */
  }
  return Object.keys(out).length > 0 ? out : null
}

export function loadAppSettings(): AppSettingsFile {
  try {
    const raw = localStorage.getItem(SETTINGS_FILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettingsFile>
      return {
        version: APP_SETTINGS_VERSION,
        theme: parsed.theme === 'light' ? 'light' : 'dark',
        captureBufferMax: clampBufferMax(
          parsed.captureBufferMax ?? defaultAppSettings.captureBufferMax,
        ),
        waveformValueType:
          parsed.waveformValueType === 'int' ? 'int' : 'float',
        textZoom: clampTextZoom(parsed.textZoom ?? defaultAppSettings.textZoom),
        plotter: normalizePlotter(parsed.plotter),
        txFileLineDelayMs: clampTxFileLineDelayMs(
          parsed.txFileLineDelayMs ?? defaultAppSettings.txFileLineDelayMs,
        ),
        shellPanelWidth: clampShellPanelWidth(
          parsed.shellPanelWidth ?? defaultAppSettings.shellPanelWidth,
        ),
        shellPanelHeight: clampShellPanelHeight(
          parsed.shellPanelHeight ?? defaultAppSettings.shellPanelHeight,
        ),
      }
    }
  } catch {
    /* fall through */
  }

  const legacy = migrateLegacy()
  if (legacy) {
    const merged: AppSettingsFile = {
      ...defaultAppSettings,
      ...legacy,
      plotter: legacy.plotter ?? defaultAppSettings.plotter,
    }
    saveAppSettings(merged)
    return merged
  }

  return defaultAppSettings
}

export function saveAppSettings(settings: AppSettingsFile) {
  try {
    localStorage.setItem(SETTINGS_FILE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

/** Merge partial updates into the persisted settings file. */
export function patchAppSettings(patch: Partial<AppSettingsFile>) {
  const current = loadAppSettings()
  const next: AppSettingsFile = {
    version: APP_SETTINGS_VERSION,
    theme: patch.theme ?? current.theme,
    captureBufferMax: patch.captureBufferMax ?? current.captureBufferMax,
    waveformValueType: patch.waveformValueType ?? current.waveformValueType,
    textZoom: patch.textZoom != null ? clampTextZoom(patch.textZoom) : current.textZoom,
    plotter: patch.plotter ? normalizePlotter(patch.plotter) : current.plotter,
    txFileLineDelayMs:
      patch.txFileLineDelayMs != null
        ? clampTxFileLineDelayMs(patch.txFileLineDelayMs)
        : current.txFileLineDelayMs,
    shellPanelWidth:
      patch.shellPanelWidth != null
        ? clampShellPanelWidth(patch.shellPanelWidth)
        : current.shellPanelWidth,
    shellPanelHeight:
      patch.shellPanelHeight != null
        ? clampShellPanelHeight(patch.shellPanelHeight)
        : current.shellPanelHeight,
  }
  saveAppSettings(next)
  return next
}

export function persistFromStore(state: {
  theme: ThemeMode
  captureBufferMax: number
  waveformValueType: WaveformValueType
  textZoom: number
  plotterSettings: PlotterSettings
  txFileLineDelayMs: number
  shellPanelWidth: number
  shellPanelHeight: number
}) {
  saveAppSettings({
    version: APP_SETTINGS_VERSION,
    theme: state.theme,
    captureBufferMax: clampBufferMax(state.captureBufferMax),
    waveformValueType: state.waveformValueType,
    textZoom: clampTextZoom(state.textZoom),
    plotter: normalizePlotter(state.plotterSettings),
    txFileLineDelayMs: clampTxFileLineDelayMs(state.txFileLineDelayMs),
    shellPanelWidth: clampShellPanelWidth(state.shellPanelWidth),
    shellPanelHeight: clampShellPanelHeight(state.shellPanelHeight),
  })
}

export { clampBufferMax, BUFFER_MIN, BUFFER_MAX, BUFFER_DEFAULT, PLOTTER_SAMPLES_DEFAULT }
