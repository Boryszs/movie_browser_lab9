import { useState } from 'react'
import { getTmdbImageUrl } from '../api/tmdbClient'

type MoviePosterProps = {
  path: string | null
  title: string
  size?: string
  className?: string
}

export function MoviePoster({ path, title, size = 'w500', className = '' }: MoviePosterProps) {
  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null)
  const posterUrl = getTmdbImageUrl(path, size)
  const imageClassName = ['poster', className].filter(Boolean).join(' ')
  const placeholderClassName = ['poster-placeholder', className].filter(Boolean).join(' ')
  const hasImageError = Boolean(posterUrl && posterUrl === failedPosterUrl)

  if (!posterUrl || hasImageError) {
    return (
      <div className={placeholderClassName} role="img" aria-label={`Brak plakatu dla filmu ${title}`}>
        Brak plakatu
      </div>
    )
  }

  return (
    <img
      className={imageClassName}
      src={posterUrl}
      alt={`Plakat filmu ${title}`}
      loading="lazy"
      onError={() => setFailedPosterUrl(posterUrl)}
    />
  )
}
