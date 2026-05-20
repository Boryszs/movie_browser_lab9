export const MOCK_API_PARAM = 'mockApi'
export const MOCK_API_401_VALUE = '401'
export const MOCK_API_REAL_VALUE = 'real'

export type MockApiMode = 'mock' | 'error-401' | 'real'

export function getMockApiMode(): MockApiMode {
  if (!import.meta.env.DEV) {
    return 'real'
  }

  if (typeof window !== 'undefined') {
    const urlMode = new URLSearchParams(window.location.search).get(MOCK_API_PARAM)

    if (urlMode === MOCK_API_401_VALUE) {
      return 'error-401'
    }

    if (urlMode === MOCK_API_REAL_VALUE) {
      return 'real'
    }
  }

  return import.meta.env.DEV ? 'mock' : 'real'
}

export function isApiMockingEnabled() {
  return getMockApiMode() !== 'real'
}

export function isMock401Enabled() {
  return getMockApiMode() === 'error-401'
}
