import { useEffect, useRef } from 'react'
import { getTmdbImageUrl } from '../api/tmdbClient'
import { useMovieDetails } from '../hooks/useMovieDetails'
import { getErrorMessage } from '../utils/errorMessage'
import { ErrorBanner } from './ErrorBanner'
import { MoviePoster } from './MoviePoster'
import { SkeletonGrid } from './SkeletonGrid'

type MovieDetailsModalProps = {
  movieId: number | null
  onClose: () => void
}


const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function formatRuntime(runtime: number | null) {
  if (!runtime) {
    return 'brak danych'
  }

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`
}

export function MovieDetailsModal({ movieId, onClose }: MovieDetailsModalProps) {
  const { data, error, isError, isPending, refetch } = useMovieDetails(movieId)
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

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

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

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElementRef.current?.focus()
    }
  }, [movieId, onClose])

  if (movieId === null) {
    return null
  }

  const backdropUrl = getTmdbImageUrl(data?.backdrop_path ?? null, 'w780')

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={modalRef}
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Zamknij okno szczegółów filmu"
        >
          ×
        </button>

        {isPending ? <SkeletonGrid count={2} /> : null}

        {isError ? (
          <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : null}

        {data ? (
          <>
            <div
              className="modal-hero"
              style={backdropUrl ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.95), rgba(15,23,42,.45)), url(${backdropUrl})` } : undefined}
            >
              <MoviePoster path={data.poster_path} title={data.title} className="modal-poster" />
              <div>
                <p className="eyebrow">Szczegóły filmu</p>
                <h2 id="movie-details-title">{data.title}</h2>
                {data.tagline ? <p className="tagline">„{data.tagline}”</p> : null}
                <div className="movie-meta large">
                  <span>★ {data.vote_average.toFixed(1)} / 10</span>
                  <span>{data.release_date || 'brak daty'}</span>
                  <span>{formatRuntime(data.runtime)}</span>
                </div>
              </div>
            </div>

            <div className="modal-content">
              <div>
                <h3>Opis</h3>
                <p>{data.overview || 'Brak opisu w TMDB.'}</p>
              </div>
              <div>
                <h3>Gatunki</h3>
                <p>{data.genres.length > 0 ? data.genres.map((genre) => genre.name).join(', ') : 'brak danych'}</p>
              </div>
              <div>
                <h3>Status</h3>
                <p>{data.status || 'brak danych'}</p>
              </div>
              {data.homepage ? (
                <a href={data.homepage} className="details-button inline-link" target="_blank" rel="noreferrer">
                  Strona filmu
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
