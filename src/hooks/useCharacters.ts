import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RICK_AND_MORTY_ENDPOINTS } from '../api/endpoints'
import type { CharactersResponse } from '../api/types'
import { QUERY_KEYS } from '../constants/queryKeys'

export function useCharacters(page = 1, name = '') {
  const normalizedName = name.trim()

  return useQuery({
    queryKey: QUERY_KEYS.characters.page(page, normalizedName),
    queryFn: async () => {
      const { data } = await axios.get<CharactersResponse>(RICK_AND_MORTY_ENDPOINTS.characters, {
        params: {
          page,
          ...(normalizedName ? { name: normalizedName } : {}),
        },
      })

      return data
    },
    placeholderData: keepPreviousData,
  })
}
