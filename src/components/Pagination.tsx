type PaginationProps = {
  page: number
  totalPages: number
  isPlaceholderData: boolean
  onChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  isPlaceholderData,
  onChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1)

  return (
    <nav className="pagination" aria-label="Paginacja filmów">
      <button
        type="button"
        className="secondary-button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(page - 1, 1))}
      >
        Poprzednia
      </button>

      <span>
        Strona <strong>{page}</strong> z <strong>{safeTotalPages}</strong>
        {isPlaceholderData ? ' · poprzednie dane' : ''}
      </span>

      <button
        type="button"
        className="secondary-button"
        disabled={page >= safeTotalPages || isPlaceholderData}
        onClick={() => onChange(page + 1)}
      >
        Następna
      </button>
    </nav>
  )
}
