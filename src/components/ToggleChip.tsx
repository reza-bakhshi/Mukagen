interface ToggleChipProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleChip({ label, checked, onChange, disabled, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`wb-chip ${checked ? 'wb-chip-on' : ''} ${className ?? ''}`}
    >
      {label}
    </button>
  )
}
