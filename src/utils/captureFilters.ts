import type { CaptureEntry, CaptureDirectionFilter, ViewFormat } from '../types/serial'
import { formatBytes } from './formatBytes'

export interface CaptureFilterState {
  showTransmitted: boolean
  captureFilterDirection: CaptureDirectionFilter
  captureSearch: string
  captureHexPattern: string
  captureMinBytes: number | null
  captureMaxBytes: number | null
  captureAsciiOnly: boolean
  viewFormat: ViewFormat
}

export function filterCaptureEntries(
  entries: CaptureEntry[],
  f: CaptureFilterState,
): CaptureEntry[] {
  let list = entries

  if (!f.showTransmitted) {
    list = list.filter((e) => e.direction === 'rx')
  }

  if (f.captureFilterDirection !== 'all') {
    list = list.filter((e) => e.direction === f.captureFilterDirection)
  }

  if (f.captureMinBytes != null && f.captureMinBytes > 0) {
    list = list.filter((e) => e.raw.byteLength >= f.captureMinBytes!)
  }

  if (f.captureMaxBytes != null && f.captureMaxBytes > 0) {
    list = list.filter((e) => e.raw.byteLength <= f.captureMaxBytes!)
  }

  const hexPat = f.captureHexPattern.trim().replace(/\s+/g, '').toLowerCase()
  if (hexPat) {
    list = list.filter((e) => {
      const hex = [...e.raw].map((b) => b.toString(16).padStart(2, '0')).join('')
      return hex.includes(hexPat)
    })
  }

  if (f.captureAsciiOnly) {
    list = list.filter((e) => isMostlyPrintable(e.raw))
  }

  const q = f.captureSearch.trim().toLowerCase()
  if (q) {
    list = list.filter((e) => entryMatchesSearch(e, q))
  }

  return list
}

/** Match search text against raw bytes — independent of display format (ASCII, Hex, etc.). */
function entryMatchesSearch(entry: CaptureEntry, query: string): boolean {
  const ascii = formatBytes(entry.raw, 'ascii').toLowerCase()
  if (ascii.includes(query)) return true

  const hexSpaced = [...entry.raw]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
  const hexCompact = hexSpaced.replace(/\s/g, '')
  const queryHex = query.replace(/\s/g, '')

  if (hexSpaced.includes(query) || hexCompact.includes(queryHex)) return true

  if (/^[0-9a-f]+$/.test(queryHex) && hexCompact.includes(queryHex)) return true

  const binary = [...entry.raw]
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ')
  if (binary.includes(query)) return true

  return false
}

function isMostlyPrintable(raw: Uint8Array): boolean {
  if (raw.length === 0) return false
  let printable = 0
  for (const b of raw) {
    if (b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b <= 0x7e)) printable++
  }
  return printable / raw.length >= 0.85
}

export function hasActiveCaptureFilters(
  f: CaptureFilterState,
  autoScroll: boolean,
  stackView: boolean,
): boolean {
  return (
    !f.showTransmitted ||
    f.captureFilterDirection !== 'all' ||
    Boolean(f.captureSearch.trim()) ||
    Boolean(f.captureHexPattern.trim()) ||
    f.captureMinBytes != null ||
    f.captureMaxBytes != null ||
    f.captureAsciiOnly ||
    !autoScroll ||
    stackView
  )
}
