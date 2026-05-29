# Raport napraw dostępności — Movie Browser

Naprawiono 7 problemów wykrytych podczas testów Lighthouse, axe, Colour Contrast Analyser oraz ręcznej weryfikacji NVDA/VoiceOver.

## 1. Dodano link „Przejdź do treści”

**Problem:** użytkownik klawiatury nie miał szybkiego sposobu pominięcia nagłówka i przejścia do głównej treści strony.

**WCAG:** 2.4.1 Bypass Blocks, poziom A

### Przed

```tsx
return (
  <>
    <header className="hero">
      ...
    </header>

    <main className="app-shell">
```

### Po

```tsx
return (
  <>
    <a className="skip-link" href="#main-content">
      Przejdź do treści
    </a>

    <header className="hero">
      ...
    </header>

    <main id="main-content" className="app-shell" tabIndex={-1}>
```

Dodano także CSS:

```css
.skip-link {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  transform: translateY(-150%);
  border-radius: 999px;
  background: #f8fafc;
  color: #111827;
  padding: 0.75rem 1rem;
  font-weight: 800;
  text-decoration: none;
}

.skip-link:focus {
  transform: translateY(0);
}
```

## 2. Poprawiono hierarchię nagłówków listy filmów

**Problem:** tytuły filmów były oznaczone jako `h3`, ale przed listą nie było logicznego nagłówka `h2`.

**WCAG:** 1.3.1 Info and Relationships / 2.4.6 Headings and Labels

### Przed

```tsx
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
```

### Po

```tsx
const moviesSectionTitle = showFavoritesOnly
  ? 'Lista ulubionych filmów'
  : shouldSearch
    ? `Wyniki wyszukiwania dla frazy ${normalizedSearchValue}`
    : 'Lista filmów'

{!isLoading && !error && visibleMovies.length > 0 ? (
  <section className="movies-section" aria-labelledby="movies-section-title">
    <h2 id="movies-section-title" className="visually-hidden">
      {moviesSectionTitle}
    </h2>
    <MovieGrid
      movies={visibleMovies}
      genresById={genresById}
      isFavorite={isFavorite}
      onOpenDetails={setSelectedMovieId}
      onToggleFavorite={handleToggleFavorite}
      dimmed={source !== 'infinite' && moviesQuery.isPlaceholderData}
    />
  </section>
) : null}
```

## 3. Poprawiono opis przycisku ulubionych

**Problem:** przycisk zawierał tylko symbol `♡` lub `♥`. Czytnik ekranu mógł odczytać sam symbol zamiast jasnej akcji.

**WCAG:** 4.1.2 Name, Role, Value, poziom A

### Przed

```tsx
<button
  type="button"
  className="favorite-button"
  aria-pressed={isFavorite}
  onClick={() => onToggleFavorite(movie)}
  title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
>
  {isFavorite ? '♥' : '♡'}
</button>
```

### Po

```tsx
<button
  type="button"
  className="favorite-button"
  aria-pressed={isFavorite}
  aria-label={
    isFavorite
      ? `Usuń film ${movie.title} z ulubionych`
      : `Dodaj film ${movie.title} do ulubionych`
  }
  onClick={() => onToggleFavorite(movie)}
  title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
>
  <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
</button>
```

## 4. Poprawiono opis przycisku „Szczegóły”

**Problem:** na wielu kartach znajdował się taki sam przycisk „Szczegóły”, bez informacji, którego filmu dotyczy.

**WCAG:** 2.4.6 Headings and Labels / 4.1.2 Name, Role, Value

### Przed

```tsx
<button type="button" className="details-button" onClick={() => onOpenDetails(movie.id)}>
  Szczegóły
</button>
```

### Po

```tsx
<button
  type="button"
  className="details-button"
  aria-label={`Pokaż szczegóły filmu ${movie.title}`}
  onClick={() => onOpenDetails(movie.id)}
>
  Szczegóły
</button>
```

## 5. Poprawiono zarządzanie fokusem po otwarciu modala

**Problem:** po otwarciu modala fokus mógł pozostać na elemencie listy filmów.

**WCAG:** 2.4.3 Focus Order, poziom A

### Przed

```tsx
useEffect(() => {
  if (movieId === null) {
    return undefined
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  document.body.classList.add('modal-open')
  window.addEventListener('keydown', handleKeyDown)

  return () => {
    document.body.classList.remove('modal-open')
    window.removeEventListener('keydown', handleKeyDown)
  }
}, [movieId, onClose])
```

### Po

```tsx
const modalRef = useRef<HTMLElement | null>(null)
const closeButtonRef = useRef<HTMLButtonElement | null>(null)
const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)

useEffect(() => {
  if (movieId === null) {
    return undefined
  }

  previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null

  const focusTimer = window.setTimeout(() => {
    closeButtonRef.current?.focus()
  }, 0)

  document.body.classList.add('modal-open')

  return () => {
    window.clearTimeout(focusTimer)
    document.body.classList.remove('modal-open')
    previouslyFocusedElementRef.current?.focus()
  }
}, [movieId, onClose])
```

## 6. Dodano focus trap w modalu

**Problem:** po otwarciu okna szczegółów użytkownik mógł potencjalnie przejść tabulatorem do elementów znajdujących się za modalem.

**WCAG:** 2.1.2 No Keyboard Trap / 2.4.3 Focus Order

### Przed

```tsx
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    onClose()
  }
}
```

### Po

```tsx
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    onClose()
    return
  }

  if (event.key !== 'Tab' || !modalRef.current) {
    return
  }

  const focusableElements = Array.from(
    modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.offsetParent !== null)

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}
```

## 7. Ustabilizowano kontrast tekstu i przycisków

**Problem:** gradientowe i półprzezroczyste tła powodowały niejednoznaczne wyniki testów kontrastu, a przycisk „Szczegóły” mógł mieć zbyt niski kontrast na jasnej części gradientu.

**WCAG:** 1.4.3 Contrast Minimum, poziom AA

### Przed

```css
:root {
  --surface: rgba(17, 24, 39, 0.86);
  --accent: #8b5cf6;
  --accent-strong: #7c3aed;
}

body {
  background:
    radial-gradient(circle at top left, rgba(139, 92, 246, 0.35), transparent 36rem),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.26), transparent 34rem), var(--bg);
}

.primary-button,
.details-button {
  background: linear-gradient(135deg, var(--accent), #06b6d4);
  color: white;
}
```

### Po

```css
:root {
  --surface: #111827;
  --accent: #6d28d9;
  --accent-strong: #5b21b6;
  --accent-blue: #0369a1;
}

body {
  background: var(--bg);
}

.primary-button,
.details-button {
  background: var(--accent-strong);
  color: white;
}
```

## Walidacja po zmianach

Wykonano:

```bash
npx tsc -b --pretty false
npm run lint -- --max-warnings=0
```

Wynik: brak błędów TypeScript i brak błędów ESLint.

Uwaga: pełny `npm run build` w tym środowisku nie został ukończony przez brak opcjonalnej binarnej zależności Vite/Rolldown dla Linuksa po rozpakowaniu projektu z Windows. To nie wynika z wprowadzonych zmian w kodzie. Na komputerze użytkownika należy uruchomić:

```bat
npm install
npm run build
```
