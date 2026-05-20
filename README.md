# Movie Browser - React Query v5 + MSW

Aplikacja Vite + React + TypeScript korzystająca w trybie developerskim z mockowanych odpowiedzi HTTP zgodnych z kontraktem TMDB API.

## Uruchomienie

```bash
npm install
npm run dev
```

Domyślnie w devie działa MSW, więc nie potrzebujesz klucza TMDB. Aplikacja mockuje:

- `GET /movie/popular`
- `GET /search/movie`
- `GET /movie/:id`
- `GET /genre/movie/list`
- `GET https://rickandmortyapi.com/api/character`

Jeśli chcesz świadomie użyć prawdziwego TMDB API, uruchom aplikację z parametrem:

```text
http://localhost:5173/?mockApi=real
```

Wtedy w pliku `.env` wpisz klucz TMDB v3:

```bash
VITE_TMDB_API_KEY=twoj_klucz
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

Możesz też użyć tokena v4 Read Access Token zamiast klucza v3:

```bash
VITE_TMDB_ACCESS_TOKEN=twoj_token_v4
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

## Zakres funkcji

- React Query v5: `QueryClient`, `QueryClientProvider`, `ReactQueryDevtools`, czytelne `QUERY_KEYS`.
- Popularne filmy i wyszukiwanie przez mock TMDB API.
- Debouncing 300 ms oraz minimum 2 znaki dla wyszukiwania.
- Obsługa stanów UI: skeleton, error, empty, success i poprzednie dane przy paginacji.
- Modal szczegółów filmu: `useMovieDetails` z `enabled`, więc request idzie dopiero po otwarciu modala.
- Ulubione: zapis w `localStorage` i natychmiastowy optimistic UI update.
- MSW: pełny mock endpointów TMDB oraz scenariusz HTTP 401 wywołujący `ErrorBanner`.
- Gatunki: `/genre/movie/list` i filtr po gatunku.
- Bonus: infinite scroll przez `useInfiniteQuery` i `IntersectionObserver`.
- Warm-up: hook `useCharacters` dla publicznego Rick and Morty API.

## Demo błędu 401 przez MSW

W trybie developerskim kliknij przycisk `Mock 401` albo otwórz:

```text
http://localhost:5173/?mockApi=401
```

MSW przechwytuje wtedy żądania do TMDB i zwraca odpowiedź `401`, więc lista i gatunki pokazują `ErrorBanner`. Po wyłączeniu mocka aplikacja automatycznie odczepia service workera MSW.

## Najważniejsze pliki

```text
src/
  api/
    tmdbClient.ts
    movieApi.ts
    endpoints.ts
    types.ts
  constants/
    queryKeys.ts
  hooks/
    useFetchMovies.ts
    useMovieDetails.ts
    useDebounce.ts
    useFavorites.ts
    useGenres.ts
    useInfiniteMovies.ts
    useCharacters.ts
  mocks/
    browser.ts
    handlers.ts
    config.ts
  components/
    MovieCard.tsx
    MovieDetailsModal.tsx
    MoviePoster.tsx
    SkeletonCard.tsx
    ErrorBanner.tsx
    EmptyState.tsx
  App.tsx
  main.tsx
  styles.css
```

## Sprawdzenie

```bash
npm run build
npm run lint
```
