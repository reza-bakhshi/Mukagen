import { formatBytes } from './formatBytes'

export function shouldShowShellChunk(chunk: Uint8Array, receiveFilter: string): boolean {
  const q = receiveFilter.trim().toLowerCase()
  if (!q) return true
  const ascii = formatBytes(chunk, 'ascii').toLowerCase()
  const hex = [...chunk].map((b) => b.toString(16).padStart(2, '0')).join(' ')
  return ascii.includes(q) || hex.includes(q)
}

export function toPrintableBytes(chunk: Uint8Array): Uint8Array {
  const out: number[] = []
  for (const b of chunk) {
    if (b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b <= 0x7e)) out.push(b)
    else out.push(0x2e)
  }
  return new Uint8Array(out)
}
