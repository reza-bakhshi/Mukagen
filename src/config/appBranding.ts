export const DEFAULT_APP_TITLE = 'Mukagen'
export const APP_TITLE_MAX_LENGTH = 48

/** Preset header icons (Lucide). Default matches serial terminal. */
export type AppIconPresetId =
  | 'terminal'
  | 'monitor'
  | 'cpu'
  | 'usb'
  | 'radio'
  | 'activity'
  | 'cable'

export const DEFAULT_APP_ICON_PRESET: AppIconPresetId = 'terminal'

export const APP_ICON_PRESET_LABELS: Record<AppIconPresetId, string> = {
  terminal: 'Terminal',
  monitor: 'Monitor',
  cpu: 'CPU',
  usb: 'USB',
  radio: 'Radio',
  activity: 'Activity',
  cable: 'Cable',
}
