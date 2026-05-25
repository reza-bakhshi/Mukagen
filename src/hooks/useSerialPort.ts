import { useCallback, useEffect, useRef } from 'react'
import { useSerialStore } from '../store/serialStore'
import type { SerialConfig } from '../types/serial'
import { mapSerialError } from '../utils/serialErrors'

export interface SerialPortHandlers {
  onRxChunk: (chunk: Uint8Array) => void
}

export function useSerialPort(handlers: SerialPortHandlers) {
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const rxWindowRef = useRef(0)
  const txWindowRef = useRef(0)
  const metricsTimerRef = useRef<number | null>(null)

  const { config, setStatus, setMetrics, resetMetrics, pushAlert } = useSerialStore()

  const reportError = useCallback(
    (err: unknown) => {
      const message = mapSerialError(err)
      setStatus('error')
      setMetrics({ lastError: message })
      pushAlert('error', message)
    },
    [pushAlert, setMetrics, setStatus],
  )

  const startMetricsTicker = useCallback(() => {
    if (metricsTimerRef.current) return
    metricsTimerRef.current = window.setInterval(() => {
      setMetrics({
        rxBytesPerSec: rxWindowRef.current,
        txBytesPerSec: txWindowRef.current,
      })
      rxWindowRef.current = 0
      txWindowRef.current = 0
    }, 1000)
  }, [setMetrics])

  const stopMetricsTicker = useCallback(() => {
    if (metricsTimerRef.current) {
      clearInterval(metricsTimerRef.current)
      metricsTimerRef.current = null
    }
  }, [])

  const readLoop = useCallback(
    async (port: SerialPort, signal: AbortSignal) => {
      while (!signal.aborted) {
        try {
          const reader = port.readable?.getReader()
          if (!reader) break
          readerRef.current = reader

          while (!signal.aborted) {
            const { value, done } = await reader.read()
            if (done) break
            if (!value) continue

            const chunk = value.slice()
            rxWindowRef.current += chunk.byteLength
            const { metrics } = useSerialStore.getState()
            setMetrics({ totalRx: metrics.totalRx + chunk.byteLength })
            handlersRef.current.onRxChunk(chunk)
          }
        } catch (err) {
          if (signal.aborted) break
          reportError(err)
          break
        } finally {
          readerRef.current?.releaseLock()
          readerRef.current = null
        }
        await new Promise((r) => setTimeout(r, 50))
      }
    },
    [reportError, setMetrics],
  )

  const openPort = useCallback(async () => {
    if (!('serial' in navigator)) {
      reportError(new Error('Web Serial API is not available in this browser.'))
      return
    }

    try {
      setStatus('connecting')
      const port = await navigator.serial.requestPort()
      await port.open(buildOpenOptions(config))
      portRef.current = port
      setStatus('connected')
      setMetrics({ lastError: null })
      resetMetrics()
      startMetricsTicker()
      pushAlert('success', `Connected at ${config.baudRate} baud`)

      const abort = new AbortController()
      abortRef.current = abort
      void readLoop(port, abort.signal)
    } catch (err) {
      reportError(err)
    }
  }, [config, pushAlert, readLoop, reportError, resetMetrics, setMetrics, setStatus, startMetricsTicker])

  const closePort = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = null
    stopMetricsTicker()

    try {
      await readerRef.current?.cancel()
    } catch {
      /* ignore */
    }
    try {
      await portRef.current?.close()
    } catch (err) {
      pushAlert('warning', mapSerialError(err))
    }

    portRef.current = null
    setStatus('disconnected')
    pushAlert('info', 'Serial port closed')
  }, [pushAlert, setStatus, stopMetricsTicker])

  const write = useCallback(
    async (data: Uint8Array) => {
      const port = portRef.current
      if (!port?.writable) {
        pushAlert('warning', 'Not connected — cannot send data.')
        return
      }
      const writer = port.writable.getWriter()
      try {
        await writer.write(data)
        txWindowRef.current += data.byteLength
        const { metrics } = useSerialStore.getState()
        setMetrics({ totalTx: metrics.totalTx + data.byteLength })
      } catch (err) {
        reportError(err)
      } finally {
        writer.releaseLock()
      }
    },
    [pushAlert, reportError, setMetrics],
  )

  return { openPort, closePort, write, portRef }
}

function buildOpenOptions(config: SerialConfig): SerialOptions {
  return {
    baudRate: config.baudRate,
    dataBits: config.dataBits,
    stopBits: config.stopBits,
    parity: config.parity,
    flowControl: config.flowControl,
  }
}
