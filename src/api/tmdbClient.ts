import axios from 'axios'
import { isApiMockingEnabled } from '../mocks/config'

const DEFAULT_TMDB_BASE_URL = 'https://api.themoviedb.org/3'

function normalizeTmdbBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  return normalizedBaseUrl === 'https://api.themoviedb.org' ? DEFAULT_TMDB_BASE_URL : normalizedBaseUrl
}

function looksLikeTmdbAccessToken(value: string) {
  return value.startsWith('eyJ')
}

export const tmdbConfig = {
  baseUrl: normalizeTmdbBaseUrl(import.meta.env.VITE_TMDB_BASE_URL || DEFAULT_TMDB_BASE_URL),
  apiKey: import.meta.env.VITE_TMDB_API_KEY || '',
  accessToken: import.meta.env.VITE_TMDB_ACCESS_TOKEN || '',
}

export function getTmdbImageUrl(path: string | null, size = 'w500') {
  if (!path) {
    return ''
  }

  if (/^(https?:|data:|blob:)/.test(path)) {
    return path
  }

  return `https://image.tmdb.org/t/p/${size}/${path.replace(/^\/+/, '')}`
}

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  timeout: 12_000,
})

tmdbClient.interceptors.request.use((config) => {
  const accessToken = tmdbConfig.accessToken || (looksLikeTmdbAccessToken(tmdbConfig.apiKey) ? tmdbConfig.apiKey : '')
  const apiKey = accessToken ? '' : tmdbConfig.apiKey

  if (!apiKey && !accessToken && !isApiMockingEnabled()) {
    throw new Error(
      'Brakuje VITE_TMDB_API_KEY albo VITE_TMDB_ACCESS_TOKEN w pliku .env. Skopiuj .env.example do .env i wpisz dane TMDB.',
    )
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  config.params = {
    ...(apiKey ? { api_key: apiKey } : {}),
    language: 'pl-PL',
    ...config.params,
  }

  return config
})
