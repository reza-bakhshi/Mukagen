/** Human-readable byte count / rate for sidebar stats (value + unit split for alignment). */
export function formatByteCount(n: number): { value: string; unit: string } {
  if (n < 1024) return { value: String(n), unit: 'B' }
  if (n < 1024 * 1024) return { value: (n / 1024).toFixed(1), unit: 'KB' }
  return { value: (n / (1024 * 1024)).toFixed(2), unit: 'MB' }
}

export function formatByteRate(bytesPerSec: number): { value: string; unit: string } {
  if (bytesPerSec < 1024) return { value: String(bytesPerSec), unit: 'B/s' }
  if (bytesPerSec < 1024 * 1024) {
    return { value: (bytesPerSec / 1024).toFixed(1), unit: 'KB/s' }
  }
  return { value: (bytesPerSec / (1024 * 1024)).toFixed(2), unit: 'MB/s' }
}
