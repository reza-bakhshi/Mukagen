import { create } from 'zustand'
import type { AlertType, AppAlert } from '../types/alerts'
import type {
  CaptureDirectionFilter,
  CaptureEntry,
  LineEnding,
  PortStatus,
  SerialConfig,
  SerialMetrics,
  ThemeMode,
  ViewFormat,
  WaveformPoint,
  WaveformStats,
  PlotterSettings,
  WaveformValueType,
  WorkbenchView,
} from '../types/serial'
import {
  clampBufferMax,
  clampShellPanelHeight,
  clampShellPanelWidth,
  clampTxFileLineDelayMs,
  loadAppSettings,
  persistFromStore,
} from '../utils/appSettings'
import { clampSamples } from '../utils/plotterSettings'
import { clampTextZoom } from '../utils/textZoom'

const savedSettings = loadAppSettings()

const defaultConfig: SerialConfig = {
  baudRate: 115200,
  parity: 'none',
  stopBits: 1,
  dataBits: 8,
  flowControl: 'none',
}

const defaultMetrics: SerialMetrics = {
  rxBytesPerSec: 0,
  txBytesPerSec: 0,
  totalRx: 0,
  totalTx: 0,
  frameDrops: 0,
  parityErrors: 0,
  lastError: null,
}

function computeStats(samples: number[]): WaveformStats | null {
  if (samples.length === 0) return null
  let min = samples[0]
  let max = samples[0]
  let sum = 0
  for (const v of samples) {
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }
  return { min, max, avg: sum / samples.length, count: samples.length }
}

interface SerialStore {
  config: SerialConfig
  status: PortStatus
  theme: ThemeMode
  sidebarCollapsed: boolean
  workbenchView: WorkbenchView
  viewFormat: ViewFormat
  shellDisplayHex: boolean
  txFormat: 'ascii' | 'hex'
  txLineEnding: LineEnding
  showTransmitted: boolean
  autoScroll: boolean
  stackView: boolean
  captureSearch: string
  captureHexPattern: string
  captureFilterDirection: CaptureDirectionFilter
  captureMinBytes: number | null
  captureMaxBytes: number | null
  captureAsciiOnly: boolean
  captureBufferMax: number
  shellHideNonPrintable: boolean
  shellReceiveFilter: string
  alerts: AppAlert[]
  metrics: SerialMetrics
  captureLog: CaptureEntry[]
  txHistory: string[]
  txPendingFile: { name: string; lines: string[] } | null
  waveformCapturing: boolean
  waveformValueType: WaveformValueType
  waveformPoints: WaveformPoint[]
  waveformStats: WaveformStats | null
  plotterSettings: PlotterSettings
  textZoom: number
  txFileLineDelayMs: number
  shellPanelWidth: number
  shellPanelHeight: number
  setConfig: (partial: Partial<SerialConfig>) => void
  setStatus: (status: PortStatus) => void
  setTheme: (theme: ThemeMode) => void
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setWorkbenchView: (view: WorkbenchView) => void
  setViewFormat: (format: ViewFormat) => void
  setShellDisplayHex: (v: boolean) => void
  setTxFormat: (v: 'ascii' | 'hex') => void
  setTxLineEnding: (v: LineEnding) => void
  setTxFileLineDelayMs: (ms: number) => void
  setShellPanelSize: (width: number, height: number) => void
  setShowTransmitted: (v: boolean) => void
  setAutoScroll: (v: boolean) => void
  setStackView: (v: boolean) => void
  setCaptureSearch: (q: string) => void
  setCaptureHexPattern: (p: string) => void
  setCaptureFilterDirection: (d: CaptureDirectionFilter) => void
  setCaptureMinBytes: (n: number | null) => void
  setCaptureMaxBytes: (n: number | null) => void
  setCaptureAsciiOnly: (v: boolean) => void
  setCaptureBufferMax: (max: number) => void
  setShellHideNonPrintable: (v: boolean) => void
  setShellReceiveFilter: (q: string) => void
  pushAlert: (type: AlertType, message: string) => void
  dismissAlert: (id: string) => void
  setMetrics: (metrics: Partial<SerialMetrics>) => void
  pushCapture: (entry: Omit<CaptureEntry, 'id'>) => void
  clearCapture: () => void
  pushTxHistory: (cmd: string) => void
  setTxPendingFile: (file: { name: string; lines: string[] } | null) => void
  setWaveformCapturing: (v: boolean) => void
  setWaveformValueType: (t: WaveformValueType) => void
  pushWaveformValue: (value: number) => void
  clearWaveform: () => void
  setPlotterSettings: (settings: PlotterSettings) => void
  setTextZoom: (zoom: number) => void
  resetMetrics: () => void
}

let captureId = 0
let waveformT = 0
let alertId = 0

const ALERT_TTL_MS = 3000

export const useSerialStore = create<SerialStore>((set, get) => ({
  config: defaultConfig,
  status: 'disconnected',
  theme: savedSettings.theme,
  sidebarCollapsed: false,
  workbenchView: 'console',
  viewFormat: 'hex',
  shellDisplayHex: false,
  txFormat: 'ascii',
  txLineEnding: 'crlf',
  showTransmitted: true,
  autoScroll: true,
  stackView: false,
  captureSearch: '',
  captureHexPattern: '',
  captureFilterDirection: 'all',
  captureMinBytes: null,
  captureMaxBytes: null,
  captureAsciiOnly: false,
  captureBufferMax: savedSettings.captureBufferMax,
  shellHideNonPrintable: false,
  shellReceiveFilter: '',
  alerts: [],
  metrics: defaultMetrics,
  captureLog: [],
  txHistory: [],
  txPendingFile: null,
  waveformCapturing: false,
  waveformValueType: savedSettings.waveformValueType,
  waveformPoints: [],
  waveformStats: null,
  plotterSettings: savedSettings.plotter,
  textZoom: savedSettings.textZoom,
  txFileLineDelayMs: savedSettings.txFileLineDelayMs,
  shellPanelWidth: savedSettings.shellPanelWidth,
  shellPanelHeight: savedSettings.shellPanelHeight,
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setStatus: (status) => set({ status }),
  setTheme: (theme) => {
    set({ theme })
    persistFromStore({ ...get(), theme })
  },
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setWorkbenchView: (workbenchView) => set({ workbenchView }),
  setViewFormat: (viewFormat) => set({ viewFormat }),
  setShellDisplayHex: (shellDisplayHex) => set({ shellDisplayHex }),
  setTxFormat: (txFormat) => set({ txFormat }),
  setTxLineEnding: (txLineEnding) => set({ txLineEnding }),
  setTxFileLineDelayMs: (txFileLineDelayMs) => {
    set({ txFileLineDelayMs: clampTxFileLineDelayMs(txFileLineDelayMs) })
    persistFromStore(get())
  },
  setShellPanelSize: (width, height) => {
    const shellPanelWidth = clampShellPanelWidth(width)
    const shellPanelHeight = clampShellPanelHeight(height)
    if (shellPanelWidth <= 0 || shellPanelHeight <= 0) return
    set({ shellPanelWidth, shellPanelHeight })
    persistFromStore(get())
  },
  setShowTransmitted: (showTransmitted) => set({ showTransmitted }),
  setAutoScroll: (autoScroll) => set({ autoScroll }),
  setStackView: (stackView) => set({ stackView }),
  setCaptureSearch: (captureSearch) => set({ captureSearch }),
  setCaptureHexPattern: (captureHexPattern) => set({ captureHexPattern }),
  setCaptureFilterDirection: (captureFilterDirection) => set({ captureFilterDirection }),
  setCaptureMinBytes: (captureMinBytes) => set({ captureMinBytes }),
  setCaptureMaxBytes: (captureMaxBytes) => set({ captureMaxBytes }),
  setCaptureAsciiOnly: (captureAsciiOnly) => set({ captureAsciiOnly }),
  setCaptureBufferMax: (max) => {
    const captureBufferMax = clampBufferMax(max)
    set((s) => ({
      captureBufferMax,
      captureLog: s.captureLog.slice(-captureBufferMax),
    }))
    persistFromStore(get())
  },
  setShellHideNonPrintable: (shellHideNonPrintable) => set({ shellHideNonPrintable }),
  setShellReceiveFilter: (shellReceiveFilter) => set({ shellReceiveFilter }),
  pushAlert: (type, message) => {
    const id = `alert-${++alertId}`
    const alert: AppAlert = { id, type, message }
    set((s) => ({ alerts: [...s.alerts, alert] }))
    window.setTimeout(() => {
      useSerialStore.getState().dismissAlert(id)
    }, ALERT_TTL_MS)
  },
  dismissAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  setMetrics: (metrics) => set((s) => ({ metrics: { ...s.metrics, ...metrics } })),
  pushCapture: (entry) =>
    set((s) => ({
      captureLog: [...s.captureLog, { ...entry, id: `cap-${++captureId}` }].slice(
        -s.captureBufferMax,
      ),
    })),
  clearCapture: () => set({ captureLog: [] }),
  pushTxHistory: (cmd) =>
    set((s) => ({
      txHistory: [cmd, ...s.txHistory.filter((c) => c !== cmd)].slice(0, 32),
    })),
  setTxPendingFile: (txPendingFile) => set({ txPendingFile }),
  setWaveformCapturing: (waveformCapturing) => set({ waveformCapturing }),
  setWaveformValueType: (waveformValueType) => {
    set({ waveformValueType })
    persistFromStore(get())
  },
  pushWaveformValue: (value) => {
    const max = get().plotterSettings.maxSamples
    const points = get().waveformPoints
    const next = [...points, { t: waveformT++, value }]
    const trimmed = next.length > max ? next.slice(next.length - max) : next
    const values = trimmed.map((p) => p.value)
    set({ waveformPoints: trimmed, waveformStats: computeStats(values) })
  },
  clearWaveform: () => {
    waveformT = 0
    set({ waveformPoints: [], waveformStats: null })
  },
  setTextZoom: (textZoom) => {
    set({ textZoom: clampTextZoom(textZoom) })
    persistFromStore(get())
  },
  setPlotterSettings: (settings) => {
    const maxSamples = clampSamples(settings.maxSamples)
    const plotterSettings: PlotterSettings = { ...settings, maxSamples }
    set((s) => {
      const waveformPoints = s.waveformPoints.slice(-maxSamples)
      return {
        plotterSettings,
        waveformPoints,
        waveformStats: computeStats(waveformPoints.map((p) => p.value)),
      }
    })
    persistFromStore(get())
  },
  resetMetrics: () => set({ metrics: defaultMetrics }),
}))
