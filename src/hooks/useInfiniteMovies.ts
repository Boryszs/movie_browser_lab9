import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPopularMovies } from '../api/movieApi'
import { QUERY_KEYS } from '../constants/queryKeys'

export function useInfiniteMovies(enabled = true) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.movies.infinitePopular(),
    queryFn: ({ pageParam }) => fetchPopularMovies(pageParam),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.page < Math.min(lastPage.total_pages, 500) ? lastPage.page + 1 : undefined,
  })
}
