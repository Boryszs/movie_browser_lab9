import { delay, http, HttpResponse } from 'msw'
import { tmdbConfig } from '../api/tmdbClient'
import { isMock401Enabled } from './config'
import { mockGenres, mockMovies, toMockMovieDetails } from './movieFixtures'

const PAGE_SIZE = 20
const MOCK_DELAY_MS = 700

function getTmdbMockRoute(path = '/*') {
  const tmdbBaseUrl = new URL(tmdbConfig.baseUrl, window.location.origin)
  const basePath = tmdbBaseUrl.pathname.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${tmdbBaseUrl.origin}${basePath}${normalizedPath}`
}

function createUnauthorizedResponse(request: Request) {
  return HttpResponse.json(
    {
      success: false,
      status_code: 7,
      status_message: `MSW mock 401: invalid API key for ${new URL(request.url).pathname}.`,
    },
    { status: 401 },
  )
}

async function waitForMockResponse(request: Request) {
  await delay(MOCK_DELAY_MS)

  if (isMock401Enabled()) {
    return createUnauthorizedResponse(request)
  }

  return null
}

function paginateMovies(movies: typeof mockMovies, page: number) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const totalPages = Math.max(1, Math.ceil(movies.length / PAGE_SIZE))
  const start = (safePage - 1) * PAGE_SIZE

  return {
    page: safePage,
    results: movies.slice(start, start + PAGE_SIZE),
    total_pages: totalPages,
    total_results: movies.length,
  }
}

function searchMockMovies(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL')

  if (!normalizedQuery) {
    return []
  }

  return mockMovies.filter((movie) => {
    const haystack = `${movie.title} ${movie.overview}`.toLocaleLowerCase('pl-PL')
    return haystack.includes(normalizedQuery)
  })
}

export const handlers = [
  http.get(getTmdbMockRoute('/movie/popular'), async ({ request }) => {
    const unauthorizedResponse = await waitForMockResponse(request)

    if (unauthorizedResponse) {
      return unauthorizedResponse
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)

    return HttpResponse.json(paginateMovies(mockMovies, page))
  }),

  http.get(getTmdbMockRoute('/search/movie'), async ({ request }) => {
    const unauthorizedResponse = await waitForMockResponse(request)

    if (unauthorizedResponse) {
      return unauthorizedResponse
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const query = url.searchParams.get('query') ?? ''

    return HttpResponse.json(paginateMovies(searchMockMovies(query), page))
  }),

  http.get(getTmdbMockRoute('/genre/movie/list'), async ({ request }) => {
    const unauthorizedResponse = await waitForMockResponse(request)

    if (unauthorizedResponse) {
      return unauthorizedResponse
    }

    return HttpResponse.json({ genres: mockGenres })
  }),

  http.get(getTmdbMockRoute('/movie/:movieId'), async ({ request, params }) => {
    const unauthorizedResponse = await waitForMockResponse(request)

    if (unauthorizedResponse) {
      return unauthorizedResponse
    }

    const movieId = Number(params.movieId)
    const movie = mockMovies.find((mockMovie) => mockMovie.id === movieId)

    if (!movie) {
      return HttpResponse.json(
        {
          success: false,
          status_code: 34,
          status_message: 'The resource you requested could not be found.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(toMockMovieDetails(movie))
  }),

  http.get('https://rickandmortyapi.com/api/character', async ({ request }) => {
    const unauthorizedResponse = await waitForMockResponse(request)

    if (unauthorizedResponse) {
      return unauthorizedResponse
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const names = [
      'Rick Sanchez',
      'Morty Smith',
      'Summer Smith',
      'Beth Smith',
      'Jerry Smith',
      'Birdperson',
      'Squanchy',
      'Tammy Gueterman',
      'Mr. Meeseeks',
      'Unity',
      'Abradolf Lincler',
      'Noob-Noob',
      'Krombopulos Michael',
      'Jessica',
      'Evil Morty',
      'Diane Sanchez',
      'Gene Gilligan',
      'Goldenfold',
      'Gearhead',
      'Fart',
    ]

    return HttpResponse.json({
      info: { count: names.length, pages: 1, next: null, prev: null },
      results: names.map((name, index) => ({
        id: (page - 1) * names.length + index + 1,
        name,
        status: index % 5 === 0 ? 'unknown' : 'Alive',
        species: index % 4 === 0 ? 'Alien' : 'Human',
        image: '',
      })),
    })
  }),
]
