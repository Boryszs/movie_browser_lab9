import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import type { FavoriteMovie, MovieSummary } from "./api/types";
import { EmptyState } from "./components/EmptyState";
import { ErrorBanner } from "./components/ErrorBanner";
import { GenreFilter } from "./components/GenreFilter";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { MovieGrid } from "./components/MovieGrid";
import { Pagination } from "./components/Pagination";
import { SearchBar } from "./components/SearchBar";
import { SkeletonGrid } from "./components/SkeletonGrid";
// import { StatusPill } from './components/StatusPill'
import { useDebounce } from "./hooks/useDebounce";
import { useFavorites } from "./hooks/useFavorites";
import { useFetchMovies } from "./hooks/useFetchMovies";
import { useGenres } from "./hooks/useGenres";
import { useInfiniteMovies } from "./hooks/useInfiniteMovies";
import {
  isMock401Enabled,
  MOCK_API_401_VALUE,
  MOCK_API_PARAM,
} from "./mocks/config";
import { getErrorMessage } from "./utils/errorMessage";
import { toFavoriteMovie } from "./utils/movieMapper";
import {
  ToastContainer,
  type Toast,
  type ToastType,
} from "./components/ToastContainer";
import "./components/skeleton.css";

const DESKTOP_RESULTS_SCROLL_OFFSET_PX = 128;
const MOBILE_RESULTS_SCROLL_OFFSET_PX = 16;

function scrollToPageTop(behavior: ScrollBehavior = "auto") {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
}

function scrollToElementTop(
  element: HTMLElement | null,
  behavior: ScrollBehavior = "auto",
) {
  if (!element) {
    return;
  }

  const scrollOffset =
    window.innerWidth <= 860
      ? MOBILE_RESULTS_SCROLL_OFFSET_PX
      : DESKTOP_RESULTS_SCROLL_OFFSET_PX;
  const top = Math.max(
    window.scrollY + element.getBoundingClientRect().top - scrollOffset,
    0,
  );

  window.scrollTo({
    top,
    left: 0,
    behavior,
  });
}

type MovieSource =
  | "popular"
  | "search"
  | "favorites"
  | "infinite"
  | "idle-search";

function createPageVariants(shouldReduceMotion: boolean): Variants {
  return {
    initial: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -16,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.28,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : 16,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.18,
        ease: "easeIn",
      },
    },
  };
}

function filterByGenre<T extends MovieSummary | FavoriteMovie>(
  movies: T[],
  genreId: number | null,
) {
  return genreId === null
    ? movies
    : movies.filter((movie) => movie.genre_ids.includes(genreId));
}

// function getSourceLabel(source: MovieSource) {
//   const labels: Record<MovieSource, string> = {
//     popular: 'popularne',
//     search: 'wyszukiwanie',
//     favorites: 'ulubione',
//     infinite: 'infinite scroll',
//     'idle-search': 'czekam na 2 znaki',
//   }
//
//   return labels[source]
// }

function HomePage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // const mockApiMode = getMockApiMode()
  const mock401Enabled = isMock401Enabled();
  // const apiMockingEnabled = isApiMockingEnabled()

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const normalizedSearchValue = debouncedSearchValue.trim();
  const hasSearchInput = normalizedSearchValue.length > 0;
  const shouldSearch = normalizedSearchValue.length >= 2 && !showFavoritesOnly;
  const shouldShowIdleSearch =
    hasSearchInput && normalizedSearchValue.length < 2 && !showFavoritesOnly;
  const shouldUseInfinite =
    useInfiniteScroll &&
    !showFavoritesOnly &&
    !shouldSearch &&
    !shouldShowIdleSearch;
  const shouldUseClassicList =
    !showFavoritesOnly && !shouldUseInfinite && !shouldShowIdleSearch;

  const genresQuery = useGenres();
  const moviesQuery = useFetchMovies(
    page,
    shouldSearch ? normalizedSearchValue : "",
    shouldUseClassicList,
  );
  const infiniteQuery = useInfiniteMovies(shouldUseInfinite);
  const {
    favorites,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    reorderFavorites,
  } = useFavorites();

  const source: MovieSource = showFavoritesOnly
    ? "favorites"
    : shouldShowIdleSearch
      ? "idle-search"
      : shouldSearch
        ? "search"
        : shouldUseInfinite
          ? "infinite"
          : "popular";

  const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data]);
  const genresById = useMemo(
    () => new Map(genres.map((genre) => [genre.id, genre])),
    [genres],
  );

  const rawMovies = useMemo(() => {
    if (source === "favorites") {
      return favorites;
    }

    if (source === "infinite") {
      return (
        infiniteQuery.data?.pages.flatMap((moviePage) => moviePage.results) ??
        []
      );
    }

    if (source === "popular" || source === "search") {
      return moviesQuery.data?.results ?? [];
    }

    return [];
  }, [favorites, infiniteQuery.data?.pages, moviesQuery.data?.results, source]);

  const visibleMovies = useMemo(
    () => filterByGenre(rawMovies, selectedGenreId),
    [rawMovies, selectedGenreId],
  );

  const isLoading =
    source === "infinite"
      ? infiniteQuery.isPending
      : source === "popular" || source === "search"
        ? moviesQuery.isPending || moviesQuery.isPlaceholderData
        : false;

  // const isFetching = genresQuery.isFetching || moviesQuery.isFetching || infiniteQuery.isFetching

  const error =
    source === "infinite"
      ? infiniteQuery.error
      : source === "popular" || source === "search"
        ? moviesQuery.error
        : null;

  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 1, 500);
  const shouldShowPagination =
    (source === "popular" || source === "search") &&
    !moviesQuery.isPending &&
    !error;

  // const totalResults =
  //   source === 'favorites'
  //     ? favorites.length
  //     : source === 'infinite'
  //       ? infiniteQuery.data?.pages.at(-1)?.total_results ?? 0
  //       : source === 'popular' || source === 'search'
  //         ? moviesQuery.data?.total_results ?? 0
  //         : 0

  useEffect(() => {
    if (!shouldUseInfinite || !sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];

      if (
        firstEntry?.isIntersecting &&
        infiniteQuery.hasNextPage &&
        !infiniteQuery.isFetchingNextPage
      ) {
        void infiniteQuery.fetchNextPage();
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [infiniteQuery, shouldUseInfinite]);

  const removeToast = (toastId: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  };

  const addToast = (message: string, type: ToastType = "info") => {
    const toastId = Date.now();

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: toastId,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      removeToast(toastId);
    }, 2600);
  };

  const handleRetry = () => {
    if (source === "infinite") {
      void infiniteQuery.refetch();
      return;
    }

    if (source === "popular" || source === "search") {
      void moviesQuery.refetch();
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    scrollToElementTop(resultsTopRef.current);
    setPage(nextPage);
  };

  const handleToggleFavorite = (movie: MovieSummary | FavoriteMovie) => {
    const wasFavorite = isFavorite(movie.id);

    toggleFavorite(toFavoriteMovie(movie));

    addToast(
      wasFavorite
        ? `Usunięto „${movie.title}” z ulubionych`
        : `Dodano „${movie.title}” do ulubionych`,
      wasFavorite ? "info" : "success",
    );
  };

  const handleToggleMock401 = () => {
    const url = new URL(window.location.href);

    if (mock401Enabled) {
      url.searchParams.delete(MOCK_API_PARAM);
    } else {
      url.searchParams.set(MOCK_API_PARAM, MOCK_API_401_VALUE);
    }

    window.location.assign(url.toString());
  };

  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">React Query v5 + TMDB API</p>
          <h1>Movie Browser</h1>
          <p>
            Popularne filmy, wyszukiwanie z debouncingiem i modal szczegółów
            działają na lokalnym mocku MSW zgodnym z odpowiedziami TMDB.
          </p>
        </div>
      </header>

      <main className="app-shell">
        <section className="toolbar" aria-label="Filtry i wyszukiwanie">
          <SearchBar
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value);
              setPage(1);
            }}
            onClear={() => {
              setSearchValue("");
              setPage(1);
            }}
          />

          <GenreFilter
            genres={genres}
            selectedGenreId={selectedGenreId}
            onChange={setSelectedGenreId}
            disabled={
              genresQuery.isPending || genresQuery.isError || showFavoritesOnly
            }
          />

          <div className="toggle-group" aria-label="Tryby listy">
            <button
              type="button"
              className={
                showFavoritesOnly ? "primary-button" : "secondary-button"
              }
              onClick={() =>
                setShowFavoritesOnly((currentValue) => !currentValue)
              }
            >
              Ulubione ({favoritesCount})
            </button>

            <button
              type="button"
              className={
                useInfiniteScroll ? "primary-button" : "secondary-button"
              }
              disabled={
                showFavoritesOnly || shouldSearch || shouldShowIdleSearch
              }
              onClick={() =>
                setUseInfiniteScroll((currentValue) => !currentValue)
              }
            >
              Infinite scroll
            </button>

            {import.meta.env.DEV ? (
              <button
                type="button"
                className={
                  mock401Enabled
                    ? "primary-button danger"
                    : "secondary-button danger"
                }
                onClick={handleToggleMock401}
              >
                {mock401Enabled ? "Wyłącz mock 401" : "Mock 401"}
              </button>
            ) : null}
          </div>
        </section>

        <section
          ref={resultsTopRef}
          className="results-section"
          aria-label="Wyniki filmow"
        >
        {/*
        <section className="status-row" aria-label="Status aplikacji">
          <StatusPill label="Źródło" value={getSourceLabel(source)} />
          <StatusPill label="Wyniki" value={totalResults} />
          <StatusPill label="Widoczne" value={visibleMovies.length} />
          {isFetching ? <StatusPill label="Sieć" value="odświeżanie" /> : null}
          {apiMockingEnabled ? <StatusPill label="MSW" value={mockApiMode === 'error-401' ? '401' : 'mock'} /> : null}
        </section>
        */}

        {/* Warm-up REST API: <CharacterWarmup /> */}

        {genresQuery.isError && !showFavoritesOnly ? (
          <ErrorBanner
            message={`Nie udało się pobrać gatunków: ${getErrorMessage(
              genresQuery.error,
            )}`}
          />
        ) : null}

        {source === "idle-search" ? (
          <EmptyState
            title="Wpisz minimum 2 znaki"
            description="Dopiero wtedy uruchomi się zapytanie GET /search/movie, więc Network tab nie będzie pełny requestów po każdym znaku."
          />
        ) : null}

        {error ? (
          <ErrorBanner message={getErrorMessage(error)} onRetry={handleRetry} />
        ) : null}

        {isLoading ? <SkeletonGrid /> : null}

        {!isLoading &&
        !error &&
        source !== "idle-search" &&
        visibleMovies.length === 0 ? (
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
            dimmed={source !== "infinite" && moviesQuery.isPlaceholderData}
            onReorder={
              source === "favorites"
                ? (nextMovies) =>
                    reorderFavorites(nextMovies as FavoriteMovie[])
                : undefined
            }
          />
        ) : null}

        {shouldShowPagination ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            isPlaceholderData={moviesQuery.isPlaceholderData}
            onChange={handlePageChange}
          />
        ) : null}

        {source === "infinite" ? (
          <div className="infinite-footer">
            {infiniteQuery.isFetchingNextPage ? (
              <SkeletonGrid count={4} />
            ) : null}

            {!infiniteQuery.hasNextPage && visibleMovies.length > 0 ? (
              <p>To już wszystkie dostępne strony.</p>
            ) : null}

            <div ref={sentinelRef} className="sentinel" aria-hidden="true" />
          </div>
        ) : null}
        </section>
      </main>

      <MovieDetailsModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

function App() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const pageVariants = createPageVariants(shouldReduceMotion);

  useEffect(() => {
    scrollToPageTop();
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <HomePage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
// import { useEffect, useMemo, useRef, useState } from "react";
// import type { FavoriteMovie, MovieSummary } from "./api/types";
// import { EmptyState } from "./components/EmptyState";
// import { ErrorBanner } from "./components/ErrorBanner";
// import { GenreFilter } from "./components/GenreFilter";
// import { MovieDetailsModal } from "./components/MovieDetailsModal";
// import { MovieGrid } from "./components/MovieGrid";
// import { Pagination } from "./components/Pagination";
// import { SearchBar } from "./components/SearchBar";
// import { SkeletonGrid } from "./components/SkeletonGrid";
// // import { StatusPill } from './components/StatusPill'
// import { useDebounce } from "./hooks/useDebounce";
// import { useFavorites } from "./hooks/useFavorites";
// import { useFetchMovies } from "./hooks/useFetchMovies";
// import { useGenres } from "./hooks/useGenres";
// import { useInfiniteMovies } from "./hooks/useInfiniteMovies";
// import {
//   isMock401Enabled,
//   MOCK_API_401_VALUE,
//   MOCK_API_PARAM,
// } from "./mocks/config";
// import { getErrorMessage } from "./utils/errorMessage";
// import { toFavoriteMovie } from "./utils/movieMapper";

// type MovieSource =
//   | "popular"
//   | "search"
//   | "favorites"
//   | "infinite"
//   | "idle-search";

// function filterByGenre<T extends MovieSummary | FavoriteMovie>(
//   movies: T[],
//   genreId: number | null,
// ) {
//   return genreId === null
//     ? movies
//     : movies.filter((movie) => movie.genre_ids.includes(genreId));
// }

// // function getSourceLabel(source: MovieSource) {
// //   const labels: Record<MovieSource, string> = {
// //     popular: 'popularne',
// //     search: 'wyszukiwanie',
// //     favorites: 'ulubione',
// //     infinite: 'infinite scroll',
// //     'idle-search': 'czekam na 2 znaki',
// //   }
// //
// //   return labels[source]
// // }

// function App() {
//   const pageVariants = {
//     initial: { opacity: 0, x: -16 },

//     animate: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.28, ease: "easeOut" },
//     },

//     exit: { opacity: 0, x: 16, transition: { duration: 0.18, ease: "easeIn" } },
//   };
//   const [page, setPage] = useState(1);
//   const [searchValue, setSearchValue] = useState("");
//   const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
//   const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
//   const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   // const mockApiMode = getMockApiMode()
//   const mock401Enabled = isMock401Enabled();
//   // const apiMockingEnabled = isApiMockingEnabled()

//   const debouncedSearchValue = useDebounce(searchValue, 300);
//   const normalizedSearchValue = debouncedSearchValue.trim();
//   const hasSearchInput = normalizedSearchValue.length > 0;
//   const shouldSearch = normalizedSearchValue.length >= 2 && !showFavoritesOnly;
//   const shouldShowIdleSearch =
//     hasSearchInput && normalizedSearchValue.length < 2 && !showFavoritesOnly;
//   const shouldUseInfinite =
//     useInfiniteScroll &&
//     !showFavoritesOnly &&
//     !shouldSearch &&
//     !shouldShowIdleSearch;
//   const shouldUseClassicList =
//     !showFavoritesOnly && !shouldUseInfinite && !shouldShowIdleSearch;

//   const genresQuery = useGenres();
//   const moviesQuery = useFetchMovies(
//     page,
//     shouldSearch ? normalizedSearchValue : "",
//     shouldUseClassicList,
//   );
//   const infiniteQuery = useInfiniteMovies(shouldUseInfinite);
//   const { favorites, favoritesCount, isFavorite, toggleFavorite } =
//     useFavorites();

//   const source: MovieSource = showFavoritesOnly
//     ? "favorites"
//     : shouldShowIdleSearch
//       ? "idle-search"
//       : shouldSearch
//         ? "search"
//         : shouldUseInfinite
//           ? "infinite"
//           : "popular";

//   const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data]);
//   const genresById = useMemo(
//     () => new Map(genres.map((genre) => [genre.id, genre])),
//     [genres],
//   );

//   const rawMovies = useMemo(() => {
//     if (source === "favorites") {
//       return favorites;
//     }

//     if (source === "infinite") {
//       return (
//         infiniteQuery.data?.pages.flatMap((moviePage) => moviePage.results) ??
//         []
//       );
//     }

//     if (source === "popular" || source === "search") {
//       return moviesQuery.data?.results ?? [];
//     }

//     return [];
//   }, [favorites, infiniteQuery.data?.pages, moviesQuery.data?.results, source]);

//   const visibleMovies = useMemo(
//     () => filterByGenre(rawMovies, selectedGenreId),
//     [rawMovies, selectedGenreId],
//   );

//   const isLoading =
//     source === "infinite"
//       ? infiniteQuery.isPending
//       : source === "popular" || source === "search"
//         ? moviesQuery.isPending
//         : false;
//   // const isFetching = genresQuery.isFetching || moviesQuery.isFetching || infiniteQuery.isFetching
//   const error =
//     source === "infinite"
//       ? infiniteQuery.error
//       : source === "popular" || source === "search"
//         ? moviesQuery.error
//         : null;
//   const totalPages = Math.min(moviesQuery.data?.total_pages ?? 1, 500);
//   // const totalResults =
//   //   source === 'favorites'
//   //     ? favorites.length
//   //     : source === 'infinite'
//   //       ? infiniteQuery.data?.pages.at(-1)?.total_results ?? 0
//   //       : source === 'popular' || source === 'search'
//   //         ? moviesQuery.data?.total_results ?? 0
//   //         : 0

//   useEffect(() => {
//     if (!shouldUseInfinite || !sentinelRef.current) {
//       return undefined;
//     }

//     const observer = new IntersectionObserver((entries) => {
//       const firstEntry = entries[0];

//       if (
//         firstEntry?.isIntersecting &&
//         infiniteQuery.hasNextPage &&
//         !infiniteQuery.isFetchingNextPage
//       ) {
//         void infiniteQuery.fetchNextPage();
//       }
//     });

//     observer.observe(sentinelRef.current);
//     return () => observer.disconnect();
//   }, [infiniteQuery, shouldUseInfinite]);

//   const handleRetry = () => {
//     if (source === "infinite") {
//       void infiniteQuery.refetch();
//       return;
//     }

//     if (source === "popular" || source === "search") {
//       void moviesQuery.refetch();
//     }
//   };

//   const handleToggleFavorite = (movie: MovieSummary | FavoriteMovie) => {
//     toggleFavorite(toFavoriteMovie(movie));
//   };

//   const handleToggleMock401 = () => {
//     const url = new URL(window.location.href);

//     if (mock401Enabled) {
//       url.searchParams.delete(MOCK_API_PARAM);
//     } else {
//       url.searchParams.set(MOCK_API_PARAM, MOCK_API_401_VALUE);
//     }

//     window.location.assign(url.toString());
//   };

//   return (
//     <>
//       <header className="hero">
//         <div className="hero-content">
//           <p className="eyebrow">React Query v5 + TMDB API</p>
//           <h1>Movie Browser</h1>
//           <p>
//             Popularne filmy, wyszukiwanie z debouncingiem i modal szczegółów
//             działają na lokalnym mocku MSW zgodnym z odpowiedziami TMDB.
//           </p>
//         </div>
//       </header>

//       <main className="app-shell">
//         <section className="toolbar" aria-label="Filtry i wyszukiwanie">
//           <SearchBar
//             value={searchValue}
//             onChange={(value) => {
//               setSearchValue(value);
//               setPage(1);
//             }}
//             onClear={() => {
//               setSearchValue("");
//               setPage(1);
//             }}
//           />
//           <GenreFilter
//             genres={genres}
//             selectedGenreId={selectedGenreId}
//             onChange={setSelectedGenreId}
//             disabled={
//               genresQuery.isPending || genresQuery.isError || showFavoritesOnly
//             }
//           />
//           <div className="toggle-group" aria-label="Tryby listy">
//             <button
//               type="button"
//               className={
//                 showFavoritesOnly ? "primary-button" : "secondary-button"
//               }
//               onClick={() =>
//                 setShowFavoritesOnly((currentValue) => !currentValue)
//               }
//             >
//               Ulubione ({favoritesCount})
//             </button>
//             <button
//               type="button"
//               className={
//                 useInfiniteScroll ? "primary-button" : "secondary-button"
//               }
//               disabled={
//                 showFavoritesOnly || shouldSearch || shouldShowIdleSearch
//               }
//               onClick={() =>
//                 setUseInfiniteScroll((currentValue) => !currentValue)
//               }
//             >
//               Infinite scroll
//             </button>
//             {import.meta.env.DEV ? (
//               <button
//                 type="button"
//                 className={
//                   mock401Enabled
//                     ? "primary-button danger"
//                     : "secondary-button danger"
//                 }
//                 onClick={handleToggleMock401}
//               >
//                 {mock401Enabled ? "Wyłącz mock 401" : "Mock 401"}
//               </button>
//             ) : null}
//           </div>
//         </section>

//         {/*
//         <section className="status-row" aria-label="Status aplikacji">
//           <StatusPill label="Źródło" value={getSourceLabel(source)} />
//           <StatusPill label="Wyniki" value={totalResults} />
//           <StatusPill label="Widoczne" value={visibleMovies.length} />
//           {isFetching ? <StatusPill label="Sieć" value="odświeżanie" /> : null}
//           {apiMockingEnabled ? <StatusPill label="MSW" value={mockApiMode === 'error-401' ? '401' : 'mock'} /> : null}
//         </section>
//         */}

//         {/* Warm-up REST API: <CharacterWarmup /> */}

//         {genresQuery.isError && !showFavoritesOnly ? (
//           <ErrorBanner
//             message={`Nie udało się pobrać gatunków: ${getErrorMessage(genresQuery.error)}`}
//           />
//         ) : null}

//         {source === "idle-search" ? (
//           <EmptyState
//             title="Wpisz minimum 2 znaki"
//             description="Dopiero wtedy uruchomi się zapytanie GET /search/movie, więc Network tab nie będzie pełny requestów po każdym znaku."
//           />
//         ) : null}

//         {error ? (
//           <ErrorBanner message={getErrorMessage(error)} onRetry={handleRetry} />
//         ) : null}

//         {isLoading ? <SkeletonGrid /> : null}

//         {!isLoading &&
//         !error &&
//         source !== "idle-search" &&
//         visibleMovies.length === 0 ? (
//           <EmptyState
//             title="Brak filmów do wyświetlenia"
//             description="Zmień frazę wyszukiwania, wyczyść filtr gatunku albo dodaj filmy do ulubionych."
//           />
//         ) : null}

//         {!isLoading && !error && visibleMovies.length > 0 ? (
//           <MovieGrid
//             movies={visibleMovies}
//             genresById={genresById}
//             isFavorite={isFavorite}
//             onOpenDetails={setSelectedMovieId}
//             onToggleFavorite={handleToggleFavorite}
//             dimmed={source !== "infinite" && moviesQuery.isPlaceholderData}
//           />
//         ) : null}

//         {source === "popular" || source === "search" ? (
//           !isLoading && !error ? (
//             <Pagination
//               page={page}
//               totalPages={totalPages}
//               isPlaceholderData={moviesQuery.isPlaceholderData}
//               onChange={setPage}
//             />
//           ) : null
//         ) : null}

//         {source === "infinite" ? (
//           <div className="infinite-footer">
//             {infiniteQuery.isFetchingNextPage ? (
//               <SkeletonGrid count={4} />
//             ) : null}
//             {!infiniteQuery.hasNextPage && visibleMovies.length > 0 ? (
//               <p>To już wszystkie dostępne strony.</p>
//             ) : null}
//             <div ref={sentinelRef} className="sentinel" aria-hidden="true" />
//           </div>
//         ) : null}
//       </main>

//       <MovieDetailsModal
//         movieId={selectedMovieId}
//         onClose={() => setSelectedMovieId(null)}
//       />
//     </>
//   );
// }

// export default App;
