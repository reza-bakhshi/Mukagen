import type { CaptureEntry, ViewFormat } from '../types/serial'
import { formatBytes } from './formatBytes'
import { downloadBlob } from './formatBytes'

export function exportCaptureLog(
  entries: CaptureEntry[],
  format: 'json' | 'csv',
  viewFormat: ViewFormat = 'hex',
) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const serializable = entries.map((e) => ({
    timestamp: e.timestamp,
    direction: e.direction,
    formatted: formatBytes(e.raw, viewFormat),
    hex: [...e.raw].map((b) => b.toString(16).padStart(2, '0')).join(' '),
  }))
  if (format === 'json') {
    downloadBlob(
      `capture-${stamp}.json`,
      new Blob([JSON.stringify(serializable, null, 2)], { type: 'application/json' }),
    )
    return
  }
  const header = 'timestamp,direction,formatted'
  const rows = serializable.map(
    (e) =>
      `${e.timestamp},${e.direction},"${e.formatted.replace(/"/g, '""')}"`,
  )
  downloadBlob(
    `capture-${stamp}.csv`,
    new Blob([[header, ...rows].join('\n')], { type: 'text/csv' }),
  )
}
