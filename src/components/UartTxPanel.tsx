import { FileText, FileUp, History, Send, Type, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { HexIcon } from './HexIcon'
import { SegmentedControl } from './SegmentedControl'
import { useSerialStore } from '../store/serialStore'
import { TX_FILE_LINE_DELAY_MAX, TX_FILE_LINE_DELAY_MIN } from '../utils/appSettings'
import { lineEndingBytes } from '../utils/formatBytes'

interface UartTxPanelProps {
  onTransmit: (data: Uint8Array) => void
  disabled?: boolean
}

export function UartTxPanel({ onTransmit, disabled }: UartTxPanelProps) {
  const {
    txFormat,
    txLineEnding,
    txHistory,
    txPendingFile,
    setTxFormat,
    setTxLineEnding,
    setTxPendingFile,
    pushTxHistory,
    txFileLineDelayMs,
    setTxFileLineDelayMs,
  } = useSerialStore()
  const [input, setInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const buildPayload = useCallback(
    (text: string): Uint8Array | null => {
      const trimmed = text.trim()
      if (!trimmed) return null
      let payload: Uint8Array
      if (txFormat === 'hex') {
        const parts = trimmed.split(/\s+/).filter(Boolean)
        payload = new Uint8Array(parts.map((p) => parseInt(p, 16)))
      } else {
        payload = new TextEncoder().encode(trimmed)
      }
      const suffix = lineEndingBytes(txLineEnding)
      const combined = new Uint8Array(payload.length + suffix.length)
      combined.set(payload)
      combined.set(suffix, payload.length)
      return combined
    },
    [txFormat, txLineEnding],
  )

  const transmitText = useCallback(
    (text: string, addToHistory = true) => {
      if (disabled) return
      const combined = buildPayload(text)
      if (!combined) return
      onTransmit(combined)
      if (addToHistory) pushTxHistory(text.trim())
    },
    [disabled, buildPayload, onTransmit, pushTxHistory],
  )

  const send = useCallback(() => {
    if (!input.trim()) return
    transmitText(input)
    setInput('')
  }, [input, transmitText])

  const sendLines = useCallback(
    async (lines: string[]) => {
      const delay = useSerialStore.getState().txFileLineDelayMs
      for (let i = 0; i < lines.length; i++) {
        transmitText(lines[i])
        if (i < lines.length - 1 && delay > 0) {
          await new Promise((r) => setTimeout(r, delay))
        }
      }
    },
    [transmitText],
  )

  const loadFile = useCallback(
    async (file: File) => {
      const lines = (await file.text()).split(/\r?\n/).filter((l) => l.trim())
      if (lines.length === 0) return
      setTxPendingFile({ name: file.name, lines })
    },
    [setTxPendingFile],
  )

  const sendPendingFile = useCallback(async () => {
    if (!txPendingFile) return
    await sendLines(txPendingFile.lines)
  }, [txPendingFile, sendLines])

  return (
    <div className="wb-pane shrink-0 p-3">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="wb-pane-header mb-0">
          <Send size={15} style={{ color: 'var(--app-accent)' }} />
          Send
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {(['ascii', 'hex'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTxFormat(f)}
              className={`wb-toolbar-btn ${txFormat === f ? 'wb-format-active' : ''}`}
            >
              {f === 'ascii' ? <Type size={14} /> : <HexIcon size={14} />}
              {f}
            </button>
          ))}
          <SegmentedControl
            value={txLineEnding}
            options={[
              { value: 'lf', label: 'LF' },
              { value: 'cr', label: 'CR' },
              { value: 'crlf', label: 'CRLF' },
            ]}
            onChange={setTxLineEnding}
          />
        </div>
      </div>

      <div className="tx-body">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          disabled={disabled}
          placeholder={disabled ? 'Connect to send…' : 'Message… Enter to send, Shift+Enter for newline'}
          rows={4}
          className="tx-message wb-select-compact"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !input.trim()}
          className="tx-send wb-btn-primary inline-flex flex-col items-center justify-center"
        >
          <Send size={14} strokeWidth={2.25} />
          <span>Send</span>
        </button>
        <aside className="tx-file">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.log,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void loadFile(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="tx-choose wb-btn-ghost inline-flex items-center justify-center gap-1"
            title="Load a text file on this PC — does not write to the device"
          >
            <FileUp size={13} />
            Choose file
          </button>
          <div className="tx-file-meta">
            {txPendingFile ? (
              <div className="flex min-w-0 items-center gap-1">
                <FileText size={12} className="shrink-0" style={{ color: 'var(--app-accent)' }} />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-mono text-[10px] leading-tight"
                    style={{ color: 'var(--app-text)' }}
                    title={txPendingFile.name}
                  >
                    {txPendingFile.name}
                  </p>
                  <p className="text-[9px] tabular-nums" style={{ color: 'var(--app-text-muted)' }}>
                    {txPendingFile.lines.length} lines
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTxPendingFile(null)}
                  className="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
                  style={{ color: 'var(--app-text-muted)' }}
                  title="Clear loaded file"
                  aria-label="Clear loaded file"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <p className="text-[10px] leading-tight" style={{ color: 'var(--app-text-muted)' }}>
                No file loaded
              </p>
            )}
          </div>
          <div className="tx-actions">
            <label className="tx-delay">
              <span className="tx-field-label">Line delay (ms)</span>
              <input
                type="number"
                min={TX_FILE_LINE_DELAY_MIN}
                max={TX_FILE_LINE_DELAY_MAX}
                step={10}
                value={txFileLineDelayMs}
                onChange={(e) => setTxFileLineDelayMs(Number(e.target.value))}
                className="tx-action-h wb-select-compact tabular-nums"
                title="Wait time between each line when sending a file over serial (0 = no delay)"
              />
            </label>
            <button
              type="button"
              disabled={disabled || !txPendingFile}
              onClick={() => void sendPendingFile()}
              className="tx-action-h tx-send-lines wb-btn-primary disabled:opacity-40"
              title={
                txPendingFile
                  ? `Transmit ${txPendingFile.lines.length} lines from ${txPendingFile.name} over serial`
                  : 'Choose a file first, then transmit its lines over serial'
              }
            >
              <Send size={12} className="shrink-0" />
              <span>
                {txPendingFile
                  ? `Send ${txPendingFile.lines.length} lines`
                  : 'Send lines'}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {txHistory.length > 0 && (
        <div
          className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2.5"
          style={{ borderTop: '1px solid var(--app-divider)' }}
        >
          <span
            className="flex items-center gap-0.5 text-[10px] font-medium uppercase"
            style={{ color: 'var(--app-text-muted)' }}
          >
            <History size={11} />
            Recent
          </span>
          {txHistory.slice(0, 10).map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => transmitText(cmd, false)}
              disabled={disabled}
              className="max-w-[10rem] truncate rounded-md border px-2 py-0.5 font-mono text-[11px] transition hover:opacity-90 disabled:opacity-40"
              style={{
                borderColor: 'var(--app-border)',
                background: 'var(--app-bg)',
                color: 'var(--app-accent)',
              }}
              title={`Send: ${cmd}`}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
