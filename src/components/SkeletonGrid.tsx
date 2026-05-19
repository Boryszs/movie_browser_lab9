import { SkeletonCard } from './SkeletonCard'

type SkeletonGridProps = {
  count?: number
}

export function SkeletonGrid({ count = 12 }: SkeletonGridProps) {
  return (
    <div className="movie-grid" aria-label="Ładowanie filmów">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
