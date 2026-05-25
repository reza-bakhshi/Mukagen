import type { ViewFormat } from '../types/serial'

/** Printable ASCII for console — control chars shown as '.' except CR/LF/TAB */
export function formatBytes(data: Uint8Array, format: ViewFormat): string {
  switch (format) {
    case 'hex':
      return [...data]
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ')
    case 'binary':
      return [...data].map((b) => b.toString(2).padStart(8, '0')).join(' ')
    case 'hexdump':
      return formatHexDump(data)
    case 'ascii':
      return [...data]
        .map((b) => {
          if (b === 0x0a) return '\n'
          if (b === 0x0d) return ''
          if (b === 0x09) return '\t'
          if (b >= 0x20 && b <= 0x7e) return String.fromCharCode(b)
          return '.'
        })
        .join('')
  }
}

/** Classic hexdump: offset, 16 hex bytes (8+8), ASCII column */
export function formatHexDump(data: Uint8Array, bytesPerLine = 16): string {
  if (data.length === 0) return ''
  const lines: string[] = []
  for (let offset = 0; offset < data.length; offset += bytesPerLine) {
    const slice = data.subarray(offset, Math.min(offset + bytesPerLine, data.length))
    const addr = offset.toString(16).padStart(8, '0').toUpperCase()
    const hex: string[] = []
    const ascii: string[] = []
    for (let i = 0; i < bytesPerLine; i++) {
      if (i < slice.length) {
        const b = slice[i]
        hex.push(b.toString(16).padStart(2, '0').toUpperCase())
        ascii.push(b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.')
      } else {
        hex.push('  ')
        ascii.push(' ')
      }
    }
    const left = hex.slice(0, 8).join(' ')
    const right = hex.slice(8).join(' ')
    lines.push(`${addr}  ${left}  ${right}  |${ascii.join('')}|`)
  }
  return lines.join('\n')
}

export function formatShellHex(data: Uint8Array): string {
  const hex = [...data].map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  return hex + '\r\n'
}

export function lineEndingBytes(ending: 'lf' | 'cr' | 'crlf'): Uint8Array {
  if (ending === 'cr') return new Uint8Array([0x0d])
  if (ending === 'crlf') return new Uint8Array([0x0d, 0x0a])
  return new Uint8Array([0x0a])
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
