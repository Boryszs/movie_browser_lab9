import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchPopularMovies, searchMovies } from '../api/movieApi'
import { QUERY_KEYS } from '../constants/queryKeys'

export function useFetchMovies(page = 1, query = '', enabled = true) {
  const normalizedQuery = query.trim()
  const isSearch = normalizedQuery.length > 0

  return useQuery({
    queryKey: isSearch
      ? QUERY_KEYS.movies.search(normalizedQuery, page)
      : QUERY_KEYS.movies.popular(page),
    queryFn: () => (isSearch ? searchMovies(normalizedQuery, page) : fetchPopularMovies(page)),
    enabled: enabled && (!isSearch || normalizedQuery.length >= 2),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  })
}
