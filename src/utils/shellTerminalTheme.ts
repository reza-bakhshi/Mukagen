import type { ThemeMode } from '../types/serial'
import type { ITheme } from '@xterm/xterm'

/** xterm colors for interactive shell — keep in sync with --app-shell-bg in index.css */
export const SHELL_XTERM_THEME: Record<ThemeMode, ITheme> = {
  dark: {
    background: '#11111b',
    foreground: '#cdd6f4',
    cursor: '#89b4fa',
    selectionBackground: '#45475a',
  },
  light: {
    background: '#e6e9ef',
    foreground: '#4c4f69',
    cursor: '#7287fd',
    selectionBackground: '#acb0be',
  },
}

export function shellXtermTheme(mode: ThemeMode): ITheme {
  return { ...SHELL_XTERM_THEME[mode] }
}
