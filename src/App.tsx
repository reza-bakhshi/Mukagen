import { useCallback, useEffect, useRef } from 'react'
import { AlertToasts } from './components/AlertToasts'
import type { SerialTerminalHandle } from './components/SerialTerminal'
import { useSerialPort } from './hooks/useSerialPort'
import { WorkbenchHeader } from './layout/WorkbenchHeader'
import { WorkbenchSidebar } from './layout/WorkbenchSidebar'
import { useSerialStore } from './store/serialStore'
import { formatShellHex } from './utils/formatBytes'
import { shouldShowShellChunk, toPrintableBytes } from './utils/shellOutput'
import { WaveformBinaryParser, WaveformLineParser } from './utils/waveformParse'
import { ConsoleMonitorView } from './views/ConsoleMonitorView'
import { InteractiveShellView } from './views/InteractiveShellView'
import { AboutView } from './views/AboutView'
import { SettingsView } from './views/SettingsView'
import { PlotterView } from './views/PlotterView'

export default function App() {
  const terminalRef = useRef<SerialTerminalHandle>(null)
  const asciiParserRef = useRef(new WaveformLineParser())
  const rawParserRef = useRef(new WaveformBinaryParser())

  const {
    workbenchView,
    shellDisplayHex,
    shellHideNonPrintable,
    shellReceiveFilter,
    showTransmitted,
    theme,
    pushCapture,
    waveformCapturing,
    pushWaveformValue,
  } = useSerialStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const plotterSettings = useSerialStore((s) => s.plotterSettings)

  useEffect(() => {
    if (waveformCapturing) {
      asciiParserRef.current.reset()
      rawParserRef.current.reset()
    }
  }, [waveformCapturing, plotterSettings.inputMode])

  const feedPlotter = useCallback((chunk: Uint8Array) => {
    const {
      waveformCapturing: capturing,
      waveformValueType: valueType,
      plotterSettings: ps,
    } = useSerialStore.getState()
    if (!capturing || chunk.length === 0) return
    const parser = ps.inputMode === 'raw' ? rawParserRef.current : asciiParserRef.current
    parser.feed(chunk, valueType).forEach(pushWaveformValue)
  }, [pushWaveformValue])

  const onRxChunk = useCallback(
    (chunk: Uint8Array) => {
      pushCapture({
        timestamp: Date.now(),
        direction: 'rx',
        raw: chunk,
      })

      if (shouldShowShellChunk(chunk, shellReceiveFilter)) {
        if (shellDisplayHex) {
          terminalRef.current?.writeRaw(formatShellHex(chunk))
        } else if (shellHideNonPrintable) {
          terminalRef.current?.writeBytes(toPrintableBytes(chunk))
        } else {
          terminalRef.current?.writeBytes(chunk)
        }
      }

      feedPlotter(chunk)
    },
    [
      pushCapture,
      shellDisplayHex,
      shellHideNonPrintable,
      shellReceiveFilter,
      feedPlotter,
    ],
  )

  const { openPort, closePort, write } = useSerialPort({ onRxChunk })

  const handleTransmit = useCallback(
    (data: Uint8Array) => {
      void write(data)
      if (showTransmitted) {
        pushCapture({
          timestamp: Date.now(),
          direction: 'tx',
          raw: data,
        })
      }
      feedPlotter(data)
    },
    [write, showTransmitted, pushCapture, feedPlotter],
  )

  const handleUserInput = useCallback(
    (data: Uint8Array) => {
      void write(data)
      feedPlotter(data)
    },
    [write, feedPlotter],
  )

  const connected = useSerialStore((s) => s.status === 'connected')

  return (
    <div className="flex h-full flex-col overflow-hidden wb-surface">
      <AlertToasts />
      <WorkbenchHeader />
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <WorkbenchSidebar onConnect={openPort} onDisconnect={closePort} />
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className={
                workbenchView === 'shell'
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                  : 'pointer-events-none absolute inset-0 flex flex-col overflow-hidden opacity-0'
              }
              aria-hidden={workbenchView !== 'shell'}
            >
              <InteractiveShellView
                terminalRef={terminalRef}
                onUserInput={handleUserInput}
                connected={connected}
              />
            </div>
            {workbenchView === 'console' && (
              <ConsoleMonitorView onTransmit={handleTransmit} connected={connected} />
            )}
            {workbenchView === 'plotter' && <PlotterView />}
            {workbenchView === 'settings' && <SettingsView />}
            {workbenchView === 'about' && <AboutView />}
          </div>
        </div>
      </div>
    </div>
  )
}
