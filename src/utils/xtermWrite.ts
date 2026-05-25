import type { Terminal } from '@xterm/xterm'

const MAX_ESC_CARRY = 32

/** True if tail might be an incomplete CSI/ESC sequence (split across serial reads). */
function escTailIncomplete(tail: Uint8Array): boolean {
  if (tail.length === 0) return false
  if (tail.length === 1 && tail[0] === 0x1b) return true
  if (tail[0] !== 0x1b) return false
  if (tail.length === 2 && tail[1] !== 0x5b) return false // ESC + single char (non-CSI)
  if (tail[1] === 0x5b) {
    for (let i = 2; i < tail.length; i++) {
      if (tail[i] >= 0x40 && tail[i] <= 0x7e) return false
    }
    return true
  }
  return false
}

/** Hold trailing bytes that may complete an escape sequence on the next chunk. */
export function partitionEscTail(data: Uint8Array): [Uint8Array, Uint8Array] {
  if (data.length === 0) return [data, new Uint8Array(0)]

  let escStart = -1
  const scanFrom = Math.max(0, data.length - MAX_ESC_CARRY)
  for (let i = data.length - 1; i >= scanFrom; i--) {
    if (data[i] === 0x1b) {
      escStart = i
      break
    }
  }

  if (escStart < 0) return [data, new Uint8Array(0)]

  const tail = data.subarray(escStart)
  if (!escTailIncomplete(tail)) return [data, new Uint8Array(0)]

  return [data.subarray(0, escStart), tail]
}

export function createBufferedTerminalWriter(term: Terminal) {
  let carry = new Uint8Array(0)

  const flush = (data: Uint8Array) => {
    if (data.length === 0) return
    term.write(data)
  }

  return {
    writeBytes(chunk: Uint8Array) {
      const merged = new Uint8Array(carry.length + chunk.length)
      merged.set(carry)
      merged.set(chunk, carry.length)
      const [flushPart, nextCarry] = partitionEscTail(merged)
      carry = new Uint8Array(nextCarry)
      flush(flushPart)
    },
    writeString(text: string) {
      carry = new Uint8Array(0)
      term.write(text)
    },
    reset() {
      carry = new Uint8Array(0)
    },
  }
}
