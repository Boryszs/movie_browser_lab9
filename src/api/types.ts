export type TmdbPagedResponse<T> = {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type MovieSummary = {
  adult?: boolean
  original_language?: string
  original_title?: string
  popularity?: number
  video?: boolean
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
}

export type MovieGenre = {
  id: number
  name: string
}

export type MovieDetails = {
  adult?: boolean
  budget?: number
  imdb_id?: string | null
  original_language?: string
  original_title?: string
  popularity?: number
  revenue?: number
  video?: boolean
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  runtime: number | null
  genres: MovieGenre[]
  homepage: string | null
  tagline: string | null
  status: string
}

export type GenresResponse = {
  genres: MovieGenre[]
}

export type FavoriteMovie = Pick<
  MovieSummary,
  'id' | 'title' | 'overview' | 'poster_path' | 'backdrop_path' | 'release_date' | 'vote_average' | 'vote_count' | 'genre_ids'
>

export type Character = {
  id: number
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  image: string
}

export type CharactersResponse = {
  info: {
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
  results: Character[]
}
