import { useEffect, useMemo, useRef, useState } from 'react'
import type { FavoriteMovie, MovieSummary } from './api/types'
import { EmptyState } from './components/EmptyState'
import { ErrorBanner } from './components/ErrorBanner'
import { GenreFilter } from './components/GenreFilter'
import { MovieDetailsModal } from './components/MovieDetailsModal'
import { MovieGrid } from './components/MovieGrid'
import { Pagination } from './components/Pagination'
import { SearchBar } from './components/SearchBar'
import { SkeletonGrid } from './components/SkeletonGrid'
import { StatusPill } from './components/StatusPill'
import { useDebounce } from './hooks/useDebounce'
import { useFavorites } from './hooks/useFavorites'
import { useFetchMovies } from './hooks/useFetchMovies'
import { useGenres } from './hooks/useGenres'
import { useInfiniteMovies } from './hooks/useInfiniteMovies'
import { isMock401Enabled, MOCK_API_401_VALUE, MOCK_API_PARAM } from './mocks/config'
import { getErrorMessage } from './utils/errorMessage'
import { toFavoriteMovie } from './utils/movieMapper'

type MovieSource = 'popular' | 'search' | 'favorites' | 'infinite' | 'idle-search'

function filterByGenre<T extends MovieSummary | FavoriteMovie>(movies: T[], genreId: number | null) {
  return genreId === null ? movies : movies.filter((movie) => movie.genre_ids.includes(genreId))
}

function getSourceLabel(source: MovieSource) {
  const labels: Record<MovieSource, string> = {
    popular: 'popularne',
    search: 'wyszukiwanie',
    favorites: 'ulubione',
    infinite: 'infinite scroll',
    'idle-search': 'czekam na 2 znaki',
  }

  return labels[source]
}

function App() {
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const mock401Enabled = import.meta.env.DEV && isMock401Enabled()

  const debouncedSearchValue = useDebounce(searchValue, 300)
  const normalizedSearchValue = debouncedSearchValue.trim()
  const hasSearchInput = normalizedSearchValue.length > 0
  const shouldSearch = normalizedSearchValue.length >= 2 && !showFavoritesOnly
  const shouldShowIdleSearch = hasSearchInput && normalizedSearchValue.length < 2 && !showFavoritesOnly
  const shouldUseInfinite = useInfiniteScroll && !showFavoritesOnly && !shouldSearch && !shouldShowIdleSearch
  const shouldUseClassicList = !showFavoritesOnly && !shouldUseInfinite && !shouldShowIdleSearch

  const genresQuery = useGenres()
  const moviesQuery = useFetchMovies(page, shouldSearch ? normalizedSearchValue : '', shouldUseClassicList)
  const infiniteQuery = useInfiniteMovies(shouldUseInfinite)
  const { favorites, favoritesCount, isFavorite, toggleFavorite } = useFavorites()

  const source: MovieSource = showFavoritesOnly
    ? 'favorites'
    : shouldShowIdleSearch
      ? 'idle-search'
      : shouldSearch
        ? 'search'
        : shouldUseInfinite
          ? 'infinite'
          : 'popular'

  const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data])
  const genresById = useMemo(() => new Map(genres.map((genre) => [genre.id, genre])), [genres])

  const rawMovies = useMemo(() => {
    if (source === 'favorites') {
      return favorites
    }

    if (source === 'infinite') {
      return infiniteQuery.data?.pages.flatMap((moviePage) => moviePage.results) ?? []
    }

    if (source === 'popular' || source === 'search') {
      return moviesQuery.data?.results ?? []
    }

    return []
  }, [favorites, infiniteQuery.data?.pages, moviesQuery.data?.results, source])

  const visibleMovies = useMemo(
    () => filterByGenre(rawMovies, selectedGenreId),
    [rawMovies, selectedGenreId],
  )

  const isLoading = source === 'infinite' ? infiniteQuery.isPending : source === 'popular' || source === 'search' ? moviesQuery.isPending : false
  const isFetching = genresQuery.isFetching || moviesQuery.isFetching || infiniteQuery.isFetching
  const error = source === 'infinite' ? infiniteQuery.error : source === 'popular' || source === 'search' ? moviesQuery.error : null
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 1, 500)
  const totalResults =
    source === 'favorites'
      ? favorites.length
      : source === 'infinite'
        ? infiniteQuery.data?.pages.at(-1)?.total_results ?? 0
        : source === 'popular' || source === 'search'
          ? moviesQuery.data?.total_results ?? 0
          : 0


  useEffect(() => {
    if (!shouldUseInfinite || !sentinelRef.current) {
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0]

      if (firstEntry?.isIntersecting && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
        void infiniteQuery.fetchNextPage()
      }
    })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [infiniteQuery, shouldUseInfinite])

  const handleRetry = () => {
    if (source === 'infinite') {
      void infiniteQuery.refetch()
      return
    }

    if (source === 'popular' || source === 'search') {
      void moviesQuery.refetch()
    }
  }

  const handleToggleFavorite = (movie: MovieSummary | FavoriteMovie) => {
    toggleFavorite(toFavoriteMovie(movie))
  }

  const handleToggleMock401 = () => {
    const url = new URL(window.location.href)

    if (mock401Enabled) {
      url.searchParams.delete(MOCK_API_PARAM)
    } else {
      url.searchParams.set(MOCK_API_PARAM, MOCK_API_401_VALUE)
    }

    window.location.assign(url.toString())
  }

  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">React Query v5 + TMDB API</p>
          <h1>Movie Browser</h1>
          <p>
            Popularne filmy, wyszukiwanie z debouncingiem, modal szczegółów z lazy fetch, ulubione w
            localStorage i bonusowy infinite scroll.
          </p>
        </div>
      </header>

      <main className="app-shell">
        <section className="toolbar" aria-label="Filtry i wyszukiwanie">
          <SearchBar
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              setPage(1)
            }}
            onClear={() => {
              setSearchValue('')
              setPage(1)
            }}
          />
          <GenreFilter
            genres={genres}
            selectedGenreId={selectedGenreId}
            onChange={setSelectedGenreId}
            disabled={genresQuery.isPending || genresQuery.isError || showFavoritesOnly}
          />
          <div className="toggle-group" aria-label="Tryby listy">
            <button
              type="button"
              className={showFavoritesOnly ? 'primary-button' : 'secondary-button'}
              onClick={() => setShowFavoritesOnly((currentValue) => !currentValue)}
            >
              Ulubione ({favoritesCount})
            </button>
            <button
              type="button"
              className={useInfiniteScroll ? 'primary-button' : 'secondary-button'}
              disabled={showFavoritesOnly || shouldSearch || shouldShowIdleSearch}
              onClick={() => setUseInfiniteScroll((currentValue) => !currentValue)}
            >
              Infinite scroll
            </button>
            {import.meta.env.DEV ? (
              <button
                type="button"
                className={mock401Enabled ? 'primary-button danger' : 'secondary-button danger'}
                onClick={handleToggleMock401}
              >
                {mock401Enabled ? 'Wyłącz mock 401' : 'Mock 401'}
              </button>
            ) : null}
          </div>
        </section>

        <section className="status-row" aria-label="Status aplikacji">
          <StatusPill label="Źródło" value={getSourceLabel(source)} />
          <StatusPill label="Wyniki" value={totalResults} />
          <StatusPill label="Widoczne" value={visibleMovies.length} />
          {isFetching ? <StatusPill label="Sieć" value="odświeżanie" /> : null}
          {mock401Enabled ? <StatusPill label="MSW" value="401" /> : null}
        </section>

        {genresQuery.isError && !showFavoritesOnly ? (
          <ErrorBanner message={`Nie udało się pobrać gatunków: ${getErrorMessage(genresQuery.error)}`} />
        ) : null}

        {source === 'idle-search' ? (
          <EmptyState
            title="Wpisz minimum 2 znaki"
            description="Dopiero wtedy uruchomi się zapytanie GET /search/movie, więc Network tab nie będzie pełny requestów po każdym znaku."
          />
        ) : null}

        {error ? <ErrorBanner message={getErrorMessage(error)} onRetry={handleRetry} /> : null}

        {isLoading ? <SkeletonGrid /> : null}

        {!isLoading && !error && source !== 'idle-search' && visibleMovies.length === 0 ? (
          <EmptyState
            title="Brak filmów do wyświetlenia"
            description="Zmień frazę wyszukiwania, wyczyść filtr gatunku albo dodaj filmy do ulubionych."
          />
        ) : null}

        {!isLoading && !error && visibleMovies.length > 0 ? (
          <MovieGrid
            movies={visibleMovies}
            genresById={genresById}
            isFavorite={isFavorite}
            onOpenDetails={setSelectedMovieId}
            onToggleFavorite={handleToggleFavorite}
            dimmed={source !== 'infinite' && moviesQuery.isPlaceholderData}
          />
        ) : null}

        {source === 'popular' || source === 'search' ? (
          !isLoading && !error ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              isPlaceholderData={moviesQuery.isPlaceholderData}
              onChange={setPage}
            />
          ) : null
        ) : null}

        {source === 'infinite' ? (
          <div className="infinite-footer">
            {infiniteQuery.isFetchingNextPage ? <SkeletonGrid count={4} /> : null}
            {!infiniteQuery.hasNextPage && visibleMovies.length > 0 ? <p>To już wszystkie dostępne strony.</p> : null}
            <div ref={sentinelRef} className="sentinel" aria-hidden="true" />
          </div>
        ) : null}
      </main>

      <MovieDetailsModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
    </>
  )
}

export default App
