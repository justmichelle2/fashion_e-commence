"use client"

import { createContext, useCallback, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { NextIntlClientProvider, useLocale as useIntlLocale, useTranslations } from 'next-intl'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '../i18n/settings'

const LocaleContext = createContext(null)
LocaleContext.displayName = 'LocaleContext'

function LocaleBridge({ children }) {
  const router = useRouter()
  const locale = useIntlLocale()
  const intl = useTranslations()
  const availableLocales = SUPPORTED_LOCALES

  const changeLocale = useCallback(
    async (nextLocale) => {
      const normalized = String(nextLocale || '').trim().toLowerCase()
      if (!normalized || normalized === locale) return locale
      if (!availableLocales.some((entry) => entry.code === normalized)) return locale
      try {
        await fetch('/api/locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: normalized }),
        })
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
        }
      } catch (error) {
        console.warn('Failed to persist locale preference', error)
      }
      router.refresh()
      return normalized
    },
    [availableLocales, locale, router]
  )

  const translate = useCallback(
    (key, fallback) => {
      if (!key) return fallback ?? ''
      try {
        return intl(key)
      } catch (error) {
        return fallback ?? (Array.isArray(key) ? key.join('.') : key)
      }
    },
    [intl]
  )

  const value = useMemo(
    () => ({
      locale,
      defaultLocale: DEFAULT_LOCALE,
      availableLocales,
      status: 'ready',
      changeLocale,
      t: translate,
    }),
    [availableLocales, changeLocale, locale, translate]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export default function LocaleProvider({ locale = DEFAULT_LOCALE, messages = {}, children }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <LocaleBridge>{children}</LocaleBridge>
    </NextIntlClientProvider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
