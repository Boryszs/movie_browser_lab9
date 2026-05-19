import type { MovieGenre } from '../api/types'

type GenreFilterProps = {
  genres: MovieGenre[]
  selectedGenreId: number | null
  onChange: (genreId: number | null) => void
  disabled?: boolean
}

export function GenreFilter({ genres, selectedGenreId, onChange, disabled = false }: GenreFilterProps) {
  return (
    <label className="select-box">
      <span>Gatunek</span>
      <select
        value={selectedGenreId ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        disabled={disabled}
      >
        <option value="">Wszystkie gatunki</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </label>
  )
}
