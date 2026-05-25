/** Small hex glyph for format toolbar (lucide has no dedicated hex icon). */
export function HexIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 4h4v16H7zM13 4h4v16h-4z" opacity="0.35" />
      <text x="5" y="15" fontSize="9" fill="currentColor" stroke="none" fontFamily="monospace">
        0F
      </text>
    </svg>
  )
}
