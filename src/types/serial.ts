export type Parity = 'none' | 'even' | 'odd'
export type StopBits = 1 | 2
export type DataBits = 7 | 8
export type FlowControl = 'none' | 'hardware'

export interface SerialConfig {
  baudRate: number
  parity: Parity
  stopBits: StopBits
  dataBits: DataBits
  flowControl: FlowControl
}

export type PortStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type ViewFormat = 'ascii' | 'binary' | 'hex' | 'hexdump'

export type WorkbenchView = 'console' | 'shell' | 'plotter' | 'settings' | 'about'

export type LineEnding = 'lf' | 'cr' | 'crlf'

export type ThemeMode = 'light' | 'dark'

export type WaveformValueType = 'double'

export type CaptureDirection = 'rx' | 'tx'

export type CaptureDirectionFilter = 'all' | 'rx' | 'tx'

export interface CaptureEntry {
  id: string
  timestamp: number
  direction: CaptureDirection
  raw: Uint8Array
}

export interface SerialMetrics {
  rxBytesPerSec: number
  txBytesPerSec: number
  totalRx: number
  totalTx: number
  frameDrops: number
  parityErrors: number
  lastError: string | null
}

export interface WaveformPoint {
  t: number
  value: number
}

export interface WaveformStats {
  min: number
  max: number
  avg: number
  count: number
}

export type PlotterInputMode = 'ascii' | 'raw'

export interface PlotterSettings {
  maxSamples: number
  showGrid: boolean
  showReferenceLines: boolean
  strokeWidth: 1 | 2 | 3
  mouseZoom: boolean
  /** Parse newline-delimited numbers as text (default serial plotter). */
  inputMode: PlotterInputMode
  /** Gradient fill under the line. */
  showAreaFill: boolean
}
