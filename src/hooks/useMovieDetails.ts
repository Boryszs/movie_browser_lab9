import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetails } from '../api/movieApi'
import { QUERY_KEYS } from '../constants/queryKeys'

export function useMovieDetails(id: number | null) {
  const hasMovieId = id !== null

  return useQuery({
    queryKey: QUERY_KEYS.movies.detail(id),
    queryFn: () => {
      if (id === null) {
        throw new Error('Nie wybrano filmu do pobrania.')
      }

      return fetchMovieDetails(id)
    },
    enabled: hasMovieId,
    staleTime: 1000 * 60 * 10,
  })
}
