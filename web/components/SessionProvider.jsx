"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const SessionContext = createContext({
  user: null,
  token: null,
  status: 'idle',
  login: async () => { },
  register: async () => { },
  updateProfile: async () => { },
  logout: () => { },
})

const STORAGE_KEY = 'luxe-session-token'
const API_BASE_URL = 'http://localhost:5000'

async function fetchJson(endpoint, { token, ...options } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  // Prepend base URL if endpoint is relative
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const res = await fetch(url, { ...options, headers })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const raw = await res.text()
  let parsed
  if (isJson && raw) {
    try {
      parsed = JSON.parse(raw)
    } catch (err) {
      console.warn('fetchJson parse error', err)
    }
  }

  if (!res.ok) {
    const fallback = parsed?.error || parsed?.message
    const message = fallback || (raw && !raw.trim().startsWith('<') ? raw : `Request failed (${res.status})`)
    throw new Error(message || 'Request failed')
  }

  if (parsed !== undefined) return parsed
  return raw ? raw.trim() : null
}

export function SessionProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | authenticated | unauthenticated

  // bootstrap token from storage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setToken(stored)
      setStatus('loading')
    } else {
      setStatus('unauthenticated')
    }
  }, [])

  // fetch profile whenever token changes
  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function loadProfile() {
      setStatus('loading')
      try {
        const data = await fetchJson('/api/auth/me', { token })
        if (!cancelled) {
          setUser(data.user)
          setStatus('authenticated')
        }
      } catch (err) {
        console.warn('Session fetch error', err.message)
        if (!cancelled) {
          window.localStorage.removeItem(STORAGE_KEY)
          setToken(null)
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async ({ email, password }) => {
    setStatus('loading')
    const data = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, data.token)
    }
    setToken(data.token)
    setUser(data.user)
    setStatus('authenticated')
    return data.user
  }, [])

  const register = useCallback(async ({ name, email, password, role }) => {
    setStatus('loading')
    const data = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, data.token)
    }
    setToken(data.token)
    setUser(data.user)
    setStatus('authenticated')
    return data.user
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setStatus('unauthenticated')
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const updateProfile = useCallback(
    async (payload) => {
      if (!token) throw new Error('Not authenticated')
      const cleanPayload = Object.fromEntries(
        Object.entries(payload || {}).filter(([, value]) => value !== undefined)
      )
      const data = await fetchJson('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(cleanPayload),
        token,
      })
      setUser(data.user)
      return data.user
    },
    [token]
  )

  const value = useMemo(
    () => ({ user, token, status, login, register, updateProfile, logout }),
    [user, token, status, login, register, updateProfile, logout]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
