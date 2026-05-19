export const MOCK_API_PARAM = 'mockApi'
export const MOCK_API_401_VALUE = '401'

export function isMock401Enabled() {
  if (typeof window === 'undefined') {
    return false
  }

  return new URLSearchParams(window.location.search).get(MOCK_API_PARAM) === MOCK_API_401_VALUE
}
