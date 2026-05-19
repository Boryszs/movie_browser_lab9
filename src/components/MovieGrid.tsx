import type { FavoriteMovie, MovieGenre, MovieSummary } from '../api/types'
import { MovieCard } from './MovieCard'

type MovieGridProps = {
  movies: Array<MovieSummary | FavoriteMovie>
  genresById: Map<number, MovieGenre>
  isFavorite: (movieId: number) => boolean
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movie: MovieSummary | FavoriteMovie) => void
  dimmed?: boolean
}

export function MovieGrid({
  movies,
  genresById,
  isFavorite,
  onOpenDetails,
  onToggleFavorite,
  dimmed = false,
}: MovieGridProps) {
  return (
    <div className={`movie-grid ${dimmed ? 'dimmed' : ''}`}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          genresById={genresById}
          isFavorite={isFavorite(movie.id)}
          onOpenDetails={onOpenDetails}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
