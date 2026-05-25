import { SegmentedControl } from './SegmentedControl'
import { ToggleChip } from './ToggleChip'
import { useSerialStore } from '../store/serialStore'
import type { PlotterInputMode, PlotterSettings } from '../types/serial'
import {
  PLOTTER_SAMPLES_MAX,
  PLOTTER_SAMPLES_MIN,
  defaultPlotterSettings,
} from '../utils/plotterSettings'

export function PlotterSettingsPanel() {
  const { plotterSettings, setPlotterSettings } = useSerialStore()

  const patch = (partial: Partial<PlotterSettings>) => {
    setPlotterSettings({ ...plotterSettings, ...partial })
  }

  return (
    <div className="wb-plot-settings wb-pane wb-scrollbar flex h-full w-52 shrink-0 flex-col gap-2 overflow-y-auto rounded-lg p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--app-text-muted)' }}>
        Chart settings
      </p>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium" style={{ color: 'var(--app-text-muted)' }}>
          Input mode
        </span>
        <SegmentedControl<PlotterInputMode>
          value={plotterSettings.inputMode}
          options={[
            { value: 'ascii', label: 'ASCII' },
            { value: 'raw', label: 'Raw' },
          ]}
          onChange={(inputMode) => patch({ inputMode })}
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-medium" style={{ color: 'var(--app-text-muted)' }}>
          Max samples
        </span>
        <input
          type="number"
          min={PLOTTER_SAMPLES_MIN}
          max={PLOTTER_SAMPLES_MAX}
          step={100}
          value={plotterSettings.maxSamples}
          onChange={(e) => patch({ maxSamples: Number(e.target.value) })}
          className="wb-select-compact w-full text-xs"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium" style={{ color: 'var(--app-text-muted)' }}>
          Line width
        </span>
        <SegmentedControl<'1' | '2' | '3'>
          value={String(plotterSettings.strokeWidth) as '1' | '2' | '3'}
          options={[
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
          onChange={(v) => patch({ strokeWidth: Number(v) as 1 | 2 | 3 })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <ToggleChip
          label="Area shadow"
          checked={plotterSettings.showAreaFill}
          onChange={(showAreaFill) => patch({ showAreaFill })}
        />
        <ToggleChip
          label="Grid"
          checked={plotterSettings.showGrid}
          onChange={(showGrid) => patch({ showGrid })}
        />
        <ToggleChip
          label="Min / avg / max"
          checked={plotterSettings.showReferenceLines}
          onChange={(showReferenceLines) => patch({ showReferenceLines })}
        />
        <ToggleChip
          label="Zoom"
          checked={plotterSettings.mouseZoom}
          onChange={(mouseZoom) => patch({ mouseZoom })}
        />
      </div>

      <button
        type="button"
        className="wb-toolbar-btn w-full"
        onClick={() => setPlotterSettings(defaultPlotterSettings)}
      >
        Defaults
      </button>
    </div>
  )
}
