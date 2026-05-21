type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <label className="search-box">
      <span>Wyszukaj film</span>
      <div className="search-control">
        <input
          type="search"
          placeholder="np. Matrix, Batman, Diuna..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button type="button" className="ghost-button" onClick={onClear}>
            Wyczyść
          </button>
        ) : null}
      </div>
    </label>
  )
}
