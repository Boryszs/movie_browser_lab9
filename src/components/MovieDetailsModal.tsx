import { useEffect } from 'react'
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

  if (movieId === null) {
    return null
  }

  const backdropUrl = getTmdbImageUrl(data?.backdrop_path ?? null, 'w780')

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Zamknij modal">
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
