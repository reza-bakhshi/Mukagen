import { ChevronDown, ChevronRight, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { ConnectButton } from '../components/ConnectButton'
import { ThemedSelect } from '../components/ThemedSelect'
import { useSerialStore } from '../store/serialStore'
import type { DataBits, FlowControl, Parity, StopBits } from '../types/serial'

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]

interface SidebarUartPanelProps {
  collapsed: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function SidebarUartPanel({
  collapsed,
  onConnect,
  onDisconnect,
}: SidebarUartPanelProps) {
  const [uartOpen, setUartOpen] = useState(true)
  const { config, status, setConfig } = useSerialStore()
  const connected = status === 'connected'

  if (collapsed) {
    return (
      <div className="flex flex-col items-center">
        <ConnectButton
          status={status}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          compact
          iconOnly
        />
      </div>
    )
  }

  return (
    <div className="wb-pane overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => setUartOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 px-2 py-1.5 text-left"
      >
        <span
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--app-text-muted)' }}
        >
          <Settings2 size={12} />
          Serial port
        </span>
        {uartOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {uartOpen && (
        <div className="space-y-2 px-2 pb-2 pt-1">
            <UartField label="Baud rate">
              <ThemedSelect
                compact
                value={config.baudRate}
                disabled={connected}
                onChange={(e) => setConfig({ baudRate: Number(e.target.value) })}
                className="w-full"
              >
                {BAUD_RATES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </ThemedSelect>
            </UartField>

            <UartField label="Parity">
              <ThemedSelect
                compact
                value={config.parity}
                disabled={connected}
                onChange={(e) => setConfig({ parity: e.target.value as Parity })}
                className="w-full"
              >
                <option value="none">None (8N1)</option>
                <option value="even">Even</option>
                <option value="odd">Odd</option>
              </ThemedSelect>
            </UartField>

            <div className="grid grid-cols-2 gap-2">
              <UartField label="Stop bits">
                <ThemedSelect
                  compact
                  value={config.stopBits}
                  disabled={connected}
                  onChange={(e) => setConfig({ stopBits: Number(e.target.value) as StopBits })}
                  className="w-full"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </ThemedSelect>
              </UartField>
              <UartField label="Data bits">
                <ThemedSelect
                  compact
                  value={config.dataBits}
                  disabled={connected}
                  onChange={(e) => setConfig({ dataBits: Number(e.target.value) as DataBits })}
                  className="w-full"
                >
                  <option value={8}>8</option>
                  <option value={7}>7</option>
                </ThemedSelect>
              </UartField>
            </div>

            <UartField label="Flow control">
              <ThemedSelect
                compact
                value={config.flowControl}
                disabled={connected}
                onChange={(e) => setConfig({ flowControl: e.target.value as FlowControl })}
                className="w-full"
              >
                <option value="none">None</option>
                <option value="hardware">Hardware</option>
              </ThemedSelect>
            </UartField>

            <ConnectButton
              status={status}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              compact
              fullWidth
            />
        </div>
      )}
    </div>
  )
}

function UartField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium" style={{ color: 'var(--app-text-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}
