import { TMDB_ENDPOINTS } from './endpoints'
import { tmdbClient } from './tmdbClient'
import type { GenresResponse, MovieDetails, MovieSummary, TmdbPagedResponse } from './types'

export async function fetchPopularMovies(page: number) {
  const { data } = await tmdbClient.get<TmdbPagedResponse<MovieSummary>>(TMDB_ENDPOINTS.popularMovies, {
    params: { page },
  })

  return data
}

export async function searchMovies(query: string, page: number) {
  const { data } = await tmdbClient.get<TmdbPagedResponse<MovieSummary>>(TMDB_ENDPOINTS.searchMovies, {
    params: {
      include_adult: false,
      page,
      query,
    },
  })

  return data
}

export async function fetchMovieDetails(id: number) {
  const { data } = await tmdbClient.get<MovieDetails>(TMDB_ENDPOINTS.movieDetails(id))
  return data
}

export async function fetchMovieGenres() {
  const { data } = await tmdbClient.get<GenresResponse>(TMDB_ENDPOINTS.movieGenres)
  return data.genres
}
