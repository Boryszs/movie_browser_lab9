import type { FavoriteMovie, MovieGenre, MovieSummary } from '../api/types'
import { MoviePoster } from './MoviePoster'
import './MovieCard.css'

type MovieCardProps = {
  movie: MovieSummary | FavoriteMovie
  genresById: Map<number, MovieGenre>
  isFavorite: boolean
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movie: MovieSummary | FavoriteMovie) => void
}

export function MovieCard({
  movie,
  genresById,
  isFavorite,
  onOpenDetails,
  onToggleFavorite,
}: MovieCardProps) {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'brak daty'
  const genreNames = movie.genre_ids
    .map((genreId) => genresById.get(genreId)?.name)
    .filter((genreName): genreName is string => Boolean(genreName))
    .slice(0, 2)

  return (
    <article className="movie-card card">
      <button
        type="button"
        className="poster-button"
        onClick={() => onOpenDetails(movie.id)}
        aria-label={`Pokaż szczegóły filmu ${movie.title}`}
      >
        <MoviePoster path={movie.poster_path} title={movie.title} />
      </button>

      <div className="movie-card-body">
        <div className="movie-card-heading">
          <h3>{movie.title}</h3>
          <button
            type="button"
            className="favorite-button"
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(movie)}
            title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>

        <div className="movie-meta">
          <span>{releaseYear}</span>
          <span>★ {movie.vote_average.toFixed(1)}</span>
        </div>

        {genreNames.length > 0 ? <p className="genre-list">{genreNames.join(' • ')}</p> : null}
        <p className="overview">{movie.overview || 'Brak opisu w TMDB.'}</p>

        <button type="button" className="details-button" onClick={() => onOpenDetails(movie.id)}>
          Szczegóły
        </button>
      </div>
    </article>
  )
}
