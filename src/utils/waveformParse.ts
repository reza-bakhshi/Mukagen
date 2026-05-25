import type { WaveformValueType } from '../types/serial'

function parseNumbersFromText(_type: WaveformValueType, text: string): number[] {
  const values: number[] = []
  const tokens = text.split(/[\s,;]+/).filter(Boolean)
  for (const token of tokens) {
    const v = parseFloat(token)
    if (!Number.isNaN(v) && Number.isFinite(v)) values.push(v)
  }
  return values
}

const SINGLE_NUMBER = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/

/** Accumulates serial text and extracts numeric values (lines, whitespace, or one number per packet). */
export class WaveformLineParser {
  private buffer = ''

  feed(chunk: Uint8Array, type: WaveformValueType): number[] {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(chunk)
    const values: number[] = []

    if (!text.includes('\n') && !text.includes('\r')) {
      const token = text.trim()
      if (token && SINGLE_NUMBER.test(token)) {
        const parsed = parseNumbersFromText(type, token)
        if (parsed.length === 1) return parsed
      }
    }

    this.buffer += text
    let idx: number
    while ((idx = this.buffer.search(/\r?\n/)) !== -1) {
      const line = this.buffer.slice(0, idx).trim()
      this.buffer = this.buffer.slice(idx + (this.buffer[idx] === '\r' ? 2 : 1))
      if (!line) continue
      values.push(...parseNumbersFromText(type, line))
    }

    if (/[ \t,;]$/.test(this.buffer)) {
      const part = this.buffer.trimEnd()
      if (part) values.push(...parseNumbersFromText(type, part))
      this.buffer = ''
    }

    return values
  }

  reset() {
    this.buffer = ''
  }
}

/** Parses fixed-width binary samples (64-bit IEEE-754 double, little-endian). */
export class WaveformBinaryParser {
  private remainder = new Uint8Array(0)

  feed(chunk: Uint8Array, _type: WaveformValueType): number[] {
    const bytesPerSample = 8
    const merged = new Uint8Array(this.remainder.length + chunk.length)
    merged.set(this.remainder)
    merged.set(chunk, this.remainder.length)

    const values: number[] = []
    const complete = merged.length - (merged.length % bytesPerSample)
    const view = new DataView(merged.buffer, merged.byteOffset, complete)

    for (let i = 0; i < complete; i += bytesPerSample) {
      const v = view.getFloat64(i, true)
      if (Number.isFinite(v)) values.push(v)
    }

    this.remainder = merged.slice(complete)
    return values
  }

  reset() {
    this.remainder = new Uint8Array(0)
  }
}
