import { useCallback } from 'react'
import useSWR from 'swr'
import { useSession } from '../components/SessionProvider'

async function defaultFetcher(url, token) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  return res.json()
}

export function useAuthedSWR(key, options = {}) {
  const { token } = useSession()
  const {
    enabled = true,
    requiresAuth = true,
    fetcher = defaultFetcher,
    ...swrOptions
  } = options

  const shouldFetch = enabled && (!requiresAuth || token)

  const boundFetcher = useCallback((url) => fetcher(url, token), [fetcher, token])

  return useSWR(shouldFetch ? key : null, boundFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    ...swrOptions,
  })
}
