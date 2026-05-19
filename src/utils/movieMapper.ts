import type { FavoriteMovie, MovieSummary } from '../api/types'

export function toFavoriteMovie(movie: MovieSummary | FavoriteMovie): FavoriteMovie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids,
  }
}
