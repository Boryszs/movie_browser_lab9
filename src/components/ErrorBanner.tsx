type ErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>Nie udało się pobrać danych</strong>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="secondary-button" onClick={onRetry}>
          Spróbuj ponownie
        </button>
      ) : null}
    </div>
  )
}
