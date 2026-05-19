import { http, HttpResponse } from 'msw'
import { tmdbConfig } from '../api/tmdbClient'

function getTmdbMockRoute() {
  const tmdbBaseUrl = new URL(tmdbConfig.baseUrl, window.location.origin)
  const basePath = tmdbBaseUrl.pathname.replace(/\/$/, '')

  return `${tmdbBaseUrl.origin}${basePath}/*`
}

export const handlers = [
  http.get(getTmdbMockRoute(), ({ request }) =>
    HttpResponse.json(
      {
        success: false,
        status_code: 7,
        status_message: `MSW demo 401: zablokowano ${new URL(request.url).pathname}.`,
      },
      { status: 401 },
    ),
  ),
]
