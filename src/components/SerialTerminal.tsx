import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'
import { useSerialStore } from '../store/serialStore'
import { shellXtermTheme } from '../utils/shellTerminalTheme'
import { textZoomPx } from '../utils/textZoom'
import { createBufferedTerminalWriter } from '../utils/xtermWrite'
import '@xterm/xterm/css/xterm.css'

export interface SerialTerminalHandle {
  writeBytes: (data: Uint8Array) => void
  writeRaw: (data: string) => void
  clear: () => void
  /** Clear display and reset xterm parser (fixes garbled text). */
  resetDisplay: () => void
  getBufferLines: () => string[]
  focus: () => void
}

interface SerialTerminalProps {
  onUserInput: (data: Uint8Array) => void
  disabled?: boolean
}

export const SerialTerminal = forwardRef<SerialTerminalHandle, SerialTerminalProps>(
  function SerialTerminal({ onUserInput, disabled }, ref) {
    const theme = useSerialStore((s) => s.theme)
    const textZoom = useSerialStore((s) => s.textZoom)
    const containerRef = useRef<HTMLDivElement>(null)
    const termRef = useRef<Terminal | null>(null)
    const fitRef = useRef<FitAddon | null>(null)
    const writerRef = useRef<ReturnType<typeof createBufferedTerminalWriter> | null>(null)
    const onUserInputRef = useRef(onUserInput)
    const disabledRef = useRef(disabled)

    useEffect(() => {
      onUserInputRef.current = onUserInput
    }, [onUserInput])

    useEffect(() => {
      disabledRef.current = disabled
    }, [disabled])

    useImperativeHandle(ref, () => ({
      writeBytes: (data) => {
        writerRef.current?.writeBytes(data)
      },
      writeRaw: (data) => {
        writerRef.current?.writeString(data)
      },
      clear: () => {
        writerRef.current?.reset()
        termRef.current?.clear()
      },
      resetDisplay: () => {
        const term = termRef.current
        if (!term) return
        writerRef.current?.reset()
        term.reset()
        term.clear()
      },
      getBufferLines: () => [],
      focus: () => termRef.current?.focus(),
    }))

    // Mount once; theme and textZoom are applied in separate effects below.
    useEffect(() => {
      if (!containerRef.current) return

      const term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        scrollOnUserInput: false,
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        fontSize: textZoomPx(textZoom),
        lineHeight: 1.2,
        theme: shellXtermTheme(theme),
        scrollback: 10000,
        logger: {
          trace: () => {},
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      })

      const fit = new FitAddon()
      fitRef.current = fit
      term.loadAddon(fit)
      term.loadAddon(new WebLinksAddon())
      term.open(containerRef.current)
      fit.fit()

      const onData = term.onData((data) => {
        if (disabledRef.current) return
        onUserInputRef.current(new TextEncoder().encode(data))
      })

      termRef.current = term
      writerRef.current = createBufferedTerminalWriter(term)
      const ro = new ResizeObserver(() => fit.fit())
      ro.observe(containerRef.current)

      return () => {
        onData.dispose()
        ro.disconnect()
        term.dispose()
        termRef.current = null
        writerRef.current = null
        fitRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- xterm instance created once on mount
    }, [])

    useEffect(() => {
      const term = termRef.current
      const fit = fitRef.current
      if (!term) return
      term.options.fontSize = textZoomPx(textZoom)
      fit?.fit()
      term.refresh(0, term.rows - 1)
    }, [textZoom])

    useEffect(() => {
      const term = termRef.current
      if (!term) return
      term.options.theme = shellXtermTheme(theme)
      term.refresh(0, term.rows - 1)
    }, [theme])

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full overflow-hidden" />
    )
  },
)
