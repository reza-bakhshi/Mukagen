/**
 * Edit this file to update the About screen.
 * Add or remove fields in `aboutFields` — each entry becomes a row in the UI.
 */

import { builtWithSummary } from './stack'

export interface AboutField {
  /** Row label shown on the left */
  label: string
  /** Plain text value */
  value?: string
  /** If set, value is rendered as a clickable link */
  href?: string
}

export const aboutMeta = {
  appName: 'Mukagen',
  version: '1.0.0',
  tagline: 'Web Serial diagnostics for embedded devices',
}

/** Customize creator, links, license, etc. */
export const aboutFields: AboutField[] = [
  {
    label: 'Creator',
    value: 'Reza bakhshi',
  },
  {
    label: 'License',
    value: 'GNU',
  },
  {
    label: 'Built with',
    value: builtWithSummary,
  },
]
