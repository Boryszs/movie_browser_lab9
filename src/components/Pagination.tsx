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

  const handlePageChange = (nextPage: number) => {
    onChange(nextPage)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <nav className="pagination" aria-label="Paginacja filmów">
      <button
        type="button"
        className="secondary-button"
        disabled={page <= 1}
        onClick={() => handlePageChange(Math.max(page - 1, 1))}
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
        onClick={() => handlePageChange(page + 1)}
      >
        Następna
      </button>
    </nav>
  )
}