import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import axios from 'axios'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { isApiMockingEnabled } from './mocks/config'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return false
  }

  return failureCount < 2
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
  },
})

async function cleanupMockServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.includes('mockServiceWorker.js'))
      .map((registration) => registration.unregister()),
  )
}

async function prepareMocking() {
  if (!import.meta.env.DEV || !isApiMockingEnabled()) {
    await cleanupMockServiceWorker()
    return
  }

  const { worker } = await import('./mocks/browser')

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

prepareMocking()
  .catch((error: unknown) => {
    console.error('Nie udało się uruchomić MSW.', error)
  })
  .finally(renderApp)
