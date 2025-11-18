"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSession } from './SessionProvider'

const LocaleContext = createContext({
  locale: 'en',
  defaultLocale: 'en',
  availableLocales: [],
  messages: {},
  status: 'loading',
  changeLocale: () => {},
  t: (key, fallback) => fallback ?? key,
})

LocaleContext.displayName = 'LocaleContext'

const STORAGE_KEY = 'luxe-preferred-locale'

function normalizeLocale(value) {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}

function getStoredLocale() {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(STORAGE_KEY) || ''
  } catch (err) {
    console.warn('read locale storage failed', err)
    return ''
  }
}

function setStoredLocale(value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch (err) {
    console.warn('write locale storage failed', err)
  }
}

function getBrowserLocale() {
  if (typeof navigator === 'undefined') return ''
  const raw = navigator.language || navigator.languages?.[0]
  if (!raw) return ''
  return normalizeLocale(raw.split('-')[0])
}

function findSupportedLocale(candidateList, supported, fallback) {
  if (!Array.isArray(supported) || supported.length === 0) return fallback || 'en'
  const normalizedSet = supported.map((item) => normalizeLocale(item.code))
  const next = (candidateList || [])
    .map(normalizeLocale)
    .find((candidate) => candidate && normalizedSet.includes(candidate))
  return next || fallback || 'en'
}

export function LocaleProvider({ children }) {
  const { user, token } = useSession()
  const [locale, setLocale] = useState('en')
  const [defaultLocale, setDefaultLocale] = useState('en')
  const [availableLocales, setAvailableLocales] = useState([{ code: 'en', label: 'English' }])
  const [messages, setMessages] = useState({})
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function loadMetadata() {
      try {
        const res = await fetch('/api/locales', { headers: { Accept: 'application/json' } })
        const data = await res.json()
        if (cancelled) return
        const localesList = Array.isArray(data.locales) && data.locales.length > 0 ? data.locales : availableLocales
        const fallback = normalizeLocale(data.defaultLocale) || 'en'
        setAvailableLocales(localesList)
        setDefaultLocale(fallback)
        const firstChoice = findSupportedLocale(
          [user?.preferredLocale, getStoredLocale(), getBrowserLocale(), fallback],
          localesList,
          fallback
        )
        setLocale((prev) => (prev === firstChoice ? prev : firstChoice))
      } catch (err) {
        if (!cancelled) {
          console.warn('Locale metadata fetch failed', err)
          setAvailableLocales([{ code: 'en', label: 'English' }])
          setDefaultLocale('en')
        }
      }
    }
    loadMetadata()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferredLocale])

  useEffect(() => {
    if (!user?.preferredLocale) return
    const next = normalizeLocale(user.preferredLocale)
    if (!next) return
    setLocale((prev) => (prev === next ? prev : next))
  }, [user?.preferredLocale])

  useEffect(() => {
    if (!locale) return
    let cancelled = false
    async function loadMessages() {
      setStatus('loading')
      try {
        const res = await fetch(`/api/locales/${locale}`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load locale ${locale}`)
        const data = await res.json()
        if (cancelled) return
        setMessages(data.messages || {})
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        console.warn('Locale message fetch failed', err)
        setMessages({})
        setStatus('error')
      }
    }
    loadMessages()
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    if (!locale) return
    setStoredLocale(locale)
  }, [locale])

  const changeLocale = useCallback(
    async (nextLocale, { persistPreference = true } = {}) => {
      const normalized = normalizeLocale(nextLocale)
      if (!normalized || normalized === locale) return locale
      const supported = availableLocales.some((entry) => normalizeLocale(entry.code) === normalized)
      if (!supported) return locale
      setLocale(normalized)
      setStoredLocale(normalized)
      if (persistPreference && token) {
        try {
          await fetch('/api/locales/preferred', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            body: JSON.stringify({ preferredLocale: normalized }),
          })
        } catch (err) {
          console.warn('Persist preferred locale failed', err)
        }
      }
      return normalized
    },
    [availableLocales, locale, token]
  )

  const translate = useCallback(
    (key, fallback) => {
      if (!key) return fallback ?? ''
      const path = Array.isArray(key) ? key : String(key).split('.')
      let current = messages
      for (const segment of path) {
        if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
          current = current[segment]
        } else {
          current = undefined
          break
        }
      }
      if (current === undefined || current === null) {
        return fallback ?? String(Array.isArray(key) ? key.join('.') : key)
      }
      return current
    },
    [messages]
  )

  const value = useMemo(
    () => ({
      locale,
      defaultLocale,
      availableLocales,
      messages,
      status,
      changeLocale,
      t: translate,
    }),
    [locale, defaultLocale, availableLocales, messages, status, changeLocale, translate]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export default LocaleProvider
