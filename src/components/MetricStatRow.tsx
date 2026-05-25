interface MetricStatRowProps {
  label: string
  value: string
  unit: string
}

export function MetricStatRow({ label, value, unit }: MetricStatRowProps) {
  return (
    <div className="wb-metric-row">
      <dt className="wb-metric-label">{label}</dt>
      <dd className="wb-metric-value">{value}</dd>
      <dd className="wb-metric-unit">{unit}</dd>
    </div>
  )
}
