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
          aria-describedby="search-hint"
        />
        {value ? (
          <button type="button" className="ghost-button" onClick={onClear}>
            Wyczyść
          </button>
        ) : null}
      </div>
      <small id="search-hint">Request po 300 ms i minimum 2 znakach.</small>
    </label>
  )
}
