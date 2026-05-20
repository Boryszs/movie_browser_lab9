import type { MovieDetails, MovieGenre, MovieSummary } from '../api/types'

export const mockGenres: MovieGenre[] = [
  { id: 12, name: 'Przygodowy' },
  { id: 14, name: 'Fantasy' },
  { id: 16, name: 'Animacja' },
  { id: 18, name: 'Dramat' },
  { id: 28, name: 'Akcja' },
  { id: 35, name: 'Komedia' },
  { id: 53, name: 'Thriller' },
  { id: 878, name: 'Science Fiction' },
]

const movieSeeds = [
  ['Matrix: Mock Reloaded', [28, 878], 8.4],
  ['Batman: Cichy Sygnał', [28, 53], 7.8],
  ['Diuna: Pustynny Test', [12, 878], 8.1],
  ['Neonowe Miasto', [53, 878], 7.2],
  ['Kosmiczna Misja', [12, 878], 7.6],
  ['Ostatni Seans', [18, 53], 7.1],
  ['Planeta Jutra', [14, 878], 7.9],
  ['Szybki Kadr', [28, 35], 6.8],
  ['Archiwum Snów', [18, 14], 7.4],
  ['Miasto bez Mapy', [12, 53], 7.0],
  ['Robot i Reżyser', [16, 35], 6.9],
  ['Cień Premiery', [18, 53], 7.5],
] satisfies Array<[string, number[], number]>

function getMockPosterUrl(sequence: number) {
  return `https://picsum.photos/seed/movie-poster-${sequence}/500/750`
}

function getMockBackdropUrl(sequence: number) {
  return `https://picsum.photos/seed/movie-backdrop-${sequence}/1280/720`
}

export const mockMovies: MovieSummary[] = Array.from({ length: 80 }, (_, index) => {
  const [title, genreIds, rating] = movieSeeds[index % movieSeeds.length]
  const sequence = index + 1
  const releaseMonth = String((index % 12) + 1).padStart(2, '0')
  const releaseDay = String((index % 27) + 1).padStart(2, '0')

  return {
    adult: false,
    id: 10_000 + sequence,
    original_language: 'pl',
    original_title: `${title} ${Math.floor(index / movieSeeds.length) + 1}`,
    popularity: Number((120 - index * 0.7).toFixed(2)),
    title: `${title} ${Math.floor(index / movieSeeds.length) + 1}`,
    overview:
      'Mockowany opis filmu zgodny z odpowiedzią TMDB. Dane są lokalne, deterministyczne i bezpieczne do pracy bez klucza API.',
    poster_path: getMockPosterUrl(sequence),
    backdrop_path: getMockBackdropUrl(sequence),
    release_date: `2024-${releaseMonth}-${releaseDay}`,
    vote_average: Number(Math.min(9.2, rating + (index % 5) * 0.1).toFixed(1)),
    vote_count: 240 + index * 17,
    video: false,
    genre_ids: genreIds,
  }
})

export function toMockMovieDetails(movie: MovieSummary): MovieDetails {
  return {
    adult: movie.adult,
    budget: 12_000_000 + (movie.id % 20) * 250_000,
    id: movie.id,
    imdb_id: `tt${String(movie.id).padStart(7, '0')}`,
    original_language: movie.original_language,
    original_title: movie.original_title,
    popularity: movie.popularity,
    title: movie.title,
    overview: `${movie.overview} Szczegóły są zwracane dopiero po otwarciu modala, więc ten endpoint dobrze pokazuje lazy fetch.`,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    runtime: 92 + (movie.id % 48),
    genres: mockGenres.filter((genre) => movie.genre_ids.includes(genre.id)),
    homepage: `https://example.com/movies/${movie.id}`,
    revenue: 32_000_000 + (movie.id % 30) * 500_000,
    tagline: 'Lokalny mock, prawdziwy kontrakt odpowiedzi.',
    status: 'Released',
    video: movie.video,
  }
}
