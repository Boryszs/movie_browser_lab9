type StatusPillProps = {
  label: string
  value: string | number
}

export function StatusPill({ label, value }: StatusPillProps) {
  return (
    <span className="status-pill">
      <strong>{label}</strong>
      <span>{value}</span>
    </span>
  )
}
