export function mapSerialError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotFoundError':
        return 'No serial device was selected.'
      case 'SecurityError':
        return 'Serial access blocked. Use Chrome on HTTPS or localhost.'
      case 'InvalidStateError':
        return 'Serial port is busy or already open in another tab.'
      case 'NetworkError':
        return 'Device disconnected or is no longer available.'
      case 'AbortError':
        return 'Connection was cancelled.'
      default:
        return err.message || `Serial error (${err.name})`
    }
  }

  const msg = err instanceof Error ? err.message : String(err)

  if (/not found|no device/i.test(msg)) {
    return 'Serial device not found. Check USB cable and drivers.'
  }
  if (/busy|in use|already open/i.test(msg)) {
    return 'Serial port is busy. Close other apps using this port.'
  }
  if (/failed to open|open serial/i.test(msg)) {
    return 'Could not open serial port. It may be in use or permissions were denied.'
  }
  if (/web serial|not available/i.test(msg)) {
    return 'Web Serial API is not available in this browser.'
  }

  return msg || 'An unknown serial error occurred.'
}
