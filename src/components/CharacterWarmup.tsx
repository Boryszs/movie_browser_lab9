import { useState } from 'react'
import { useCharacters } from '../hooks/useCharacters'
import { ErrorBanner } from './ErrorBanner'

export function CharacterWarmup() {
  const [page, setPage] = useState(1)
  const { data, error, isError, isPending, isPlaceholderData, refetch } = useCharacters(page)
  const characters = data?.results ?? []
  const totalPages = data?.info.pages ?? 1

  return (
    <section className="warmup-panel" aria-label="Rick and Morty API warm-up">
      <div className="warmup-heading">
        <div>
          <p className="eyebrow">Warm-up REST API</p>
          <h2>Rick and Morty</h2>
        </div>
        <div className="warmup-controls">
          <button
            type="button"
            className="secondary-button"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
          >
            Poprzednia
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="secondary-button"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Następna
          </button>
        </div>
      </div>

      {isError ? <ErrorBanner message={error.message} onRetry={() => void refetch()} /> : null}

      {isPending ? (
        <div className="character-strip" aria-label="Ładowanie postaci">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="character-card skeleton-character" aria-hidden="true">
              <div className="character-avatar skeleton" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
      ) : null}

      {!isPending && !isError ? (
        <div className={`character-strip ${isPlaceholderData ? 'dimmed' : ''}`}>
          {characters.slice(0, 20).map((character) => (
            <article key={character.id} className="character-card">
              {character.image ? (
                <img className="character-avatar" src={character.image} alt={character.name} loading="lazy" />
              ) : (
                <div className="character-avatar placeholder" aria-hidden="true">
                  {character.name.slice(0, 1)}
                </div>
              )}
              <div>
                <h3>{character.name}</h3>
                <p>
                  {character.status} · {character.species}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
