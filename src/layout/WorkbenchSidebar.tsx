import {
  Activity,
  Info,
  LineChart,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Terminal,
} from 'lucide-react'
import { GitHubIcon } from '../components/GitHubIcon'
import { githubRepo } from '../config/github'
import { MetricStatRow } from '../components/MetricStatRow'
import { SidebarCollapsedTile } from '../components/SidebarCollapsedTile'
import { formatByteCount, formatByteRate } from '../utils/formatMetric'
import { SidebarUartPanel } from './SidebarUartPanel'
import { useSerialStore } from '../store/serialStore'
import type { WorkbenchView } from '../types/serial'

const MAIN_NAV: { id: WorkbenchView; label: string; icon: typeof Monitor }[] = [
  { id: 'console', label: 'Console', icon: Monitor },
  { id: 'shell', label: 'Shell', icon: Terminal },
  { id: 'plotter', label: 'Plotter', icon: LineChart },
]

const UTIL_NAV: { id: WorkbenchView; label: string; icon: typeof Settings }[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
]

interface WorkbenchSidebarProps {
  onConnect: () => void
  onDisconnect: () => void
}

function NavButton({
  id,
  label,
  icon: Icon,
  active,
  collapsed,
  onSelect,
}: {
  id: WorkbenchView
  label: string
  icon: typeof Monitor
  active: boolean
  collapsed: boolean
  onSelect: (id: WorkbenchView) => void
}) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onSelect(id)}
        title={label}
        className={`sidebar-collapsed-tile wb-nav-item ${active ? 'wb-nav-item-active' : ''}`}
      >
        <Icon size={18} strokeWidth={2} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      title={label}
      className={`wb-nav-item transition ${active ? 'wb-nav-item-active' : ''}`}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span>{label}</span>
    </button>
  )
}

function GitHubNavButton({ collapsed }: { collapsed: boolean }) {
  const openRepo = () => window.open(githubRepo.url, '_blank', 'noopener,noreferrer')

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={openRepo}
        aria-label={`${githubRepo.label} (opens in new tab)`}
        className="sidebar-collapsed-tile wb-nav-item flex items-center justify-center"
      >
        <GitHubIcon size={18} className="block" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openRepo}
      aria-label={`${githubRepo.label} (opens in new tab)`}
      className="wb-nav-item transition"
    >
      <GitHubIcon size={18} className="block shrink-0" />
      <span>{githubRepo.label}</span>
    </button>
  )
}

export function WorkbenchSidebar({ onConnect, onDisconnect }: WorkbenchSidebarProps) {
  const {
    workbenchView,
    setWorkbenchView,
    metrics,
    status,
    sidebarCollapsed,
    toggleSidebar,
  } = useSerialStore()

  const linkOk = status === 'connected'

  return (
    <aside
      className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-200"
      style={{
        width: sidebarCollapsed ? '3.5rem' : '12rem',
        background: 'var(--app-bg)',
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1.5 pt-1.5 pb-3">
        <div
          className={`wb-pane flex shrink-0 flex-col gap-0.5 rounded-lg ${
            sidebarCollapsed ? 'items-center p-1' : 'p-1.5'
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className={
              sidebarCollapsed
                ? 'sidebar-toggle sidebar-collapsed-tile'
                : 'sidebar-toggle wb-nav-item transition'
            }
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} strokeWidth={2} />
            ) : (
              <>
                <PanelLeftClose size={18} strokeWidth={2} />
                <span>Menu</span>
              </>
            )}
          </button>

          {MAIN_NAV.map((item) => (
            <NavButton
              key={item.id}
              {...item}
              active={workbenchView === item.id}
              collapsed={sidebarCollapsed}
              onSelect={setWorkbenchView}
            />
          ))}

          {UTIL_NAV.map((item) => (
            <NavButton
              key={item.id}
              {...item}
              active={workbenchView === item.id}
              collapsed={sidebarCollapsed}
              onSelect={setWorkbenchView}
            />
          ))}
          <GitHubNavButton collapsed={sidebarCollapsed} />
        </div>

        <div className="mt-auto flex shrink-0 flex-col gap-1.5">
          <SidebarUartPanel
            collapsed={sidebarCollapsed}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />

          <div className={sidebarCollapsed ? 'flex justify-center' : undefined}>
            <div
              className={
                sidebarCollapsed
                  ? 'flex justify-center'
                  : 'wb-pane overflow-hidden rounded-lg p-2'
              }
            >
              {!sidebarCollapsed ? (
                <>
                  <p
                    className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    <Activity size={12} />
                    Stats
                  </p>
                  <dl className="space-y-1 font-mono text-[11px] leading-tight">
                    <MetricStatRow label="RX" {...formatByteCount(metrics.totalRx)} />
                    <MetricStatRow label="TX" {...formatByteCount(metrics.totalTx)} />
                    <MetricStatRow label="Spd" {...formatByteRate(metrics.rxBytesPerSec)} />
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: linkOk ? 'var(--app-success)' : 'var(--app-warning)' }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: linkOk ? 'var(--app-success)' : 'var(--app-warning)' }}
                      >
                        {linkOk ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </dl>
                </>
              ) : (
                <SidebarCollapsedTile
                  title={linkOk ? 'Online' : 'Offline'}
                  className="wb-pane rounded-lg"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: linkOk ? 'var(--app-success)' : 'var(--app-warning)' }}
                  />
                </SidebarCollapsedTile>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
