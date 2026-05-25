export function HexdumpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 7h16M4 12h10M4 17h14" strokeLinecap="round" />
      <path d="M18 10v7" strokeLinecap="round" />
    </svg>
  )
}
