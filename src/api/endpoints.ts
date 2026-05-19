export const TMDB_ENDPOINTS = {
  popularMovies: '/movie/popular',
  searchMovies: '/search/movie',
  movieDetails: (id: number) => `/movie/${id}`,
  movieGenres: '/genre/movie/list',
} as const

export const RICK_AND_MORTY_ENDPOINTS = {
  characters: 'https://rickandmortyapi.com/api/character',
} as const
