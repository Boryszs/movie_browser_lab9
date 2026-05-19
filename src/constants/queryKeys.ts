export const QUERY_KEYS = {
  movies: {
    all: () => ['movies'] as const,
    popular: (page: number) => ['movies', 'popular', { page }] as const,
    infinitePopular: () => ['movies', 'popular', 'infinite'] as const,
    search: (query: string, page: number) => ['movies', 'search', { query, page }] as const,
    detail: (id: number | null) => ['movies', 'detail', { id: id ?? 'closed' }] as const,
  },
  genres: {
    all: () => ['genres', 'movies'] as const,
  },
  characters: {
    all: () => ['characters'] as const,
    page: (page: number, name: string) => ['characters', 'page', { page, name }] as const,
  },
} as const
