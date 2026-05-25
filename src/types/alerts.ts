export type AlertType = 'error' | 'success' | 'warning' | 'info'

export interface AppAlert {
  id: string
  type: AlertType
  message: string
}
