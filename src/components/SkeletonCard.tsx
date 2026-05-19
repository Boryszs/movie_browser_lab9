export function SkeletonCard() {
  return (
    <article className="movie-card skeleton-card" aria-hidden="true">
      <div className="poster skeleton" />
      <div className="movie-card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </article>
  )
}
