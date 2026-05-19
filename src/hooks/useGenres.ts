import { useQuery } from '@tanstack/react-query'
import { fetchMovieGenres } from '../api/movieApi'
import { QUERY_KEYS } from '../constants/queryKeys'

export function useGenres() {
  return useQuery({
    queryKey: QUERY_KEYS.genres.all(),
    queryFn: fetchMovieGenres,
    staleTime: 1000 * 60 * 60,
  })
}
