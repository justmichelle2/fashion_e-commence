import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export function readLocaleFromCookies(cookieHeader = '') {
  if (!cookieHeader) return ''
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .map((part) => part.split('='))
    .find(([name]) => name === LOCALE_COOKIE)?.[1] || ''
}

export function readLocaleFromStorage() {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) || ''
  } catch (error) {
    return ''
  }
}

export function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return ''
  const raw = navigator.languages?.[0] || navigator.language
  if (!raw) return ''
  return normalizeLocale(raw.split('-')[0])
}

export function detectFromAcceptLanguage(header = '') {
  if (!header) return ''
  const segments = header.split(',')
  for (const segment of segments) {
    const [lang] = segment.trim().split(';')
    if (!lang) continue
    const code = normalizeLocale(lang.split('-')[0])
    if (SUPPORTED_CODES.includes(code)) {
      return code
    }
  }
  return ''
}

export function resolveLocale({ cookieLocale = '', storageLocale = '', acceptLanguage = '', browserLocale = '' } = {}) {
  const ordered = [cookieLocale, storageLocale, browserLocale, acceptLanguage].filter(Boolean)
  for (const candidate of ordered) {
    const normalized = normalizeLocale(candidate)
    if (SUPPORTED_CODES.includes(normalized)) {
      return normalized
    }
  }
  return DEFAULT_LOCALE
}

export function serializeLocaleCookie(locale) {
  const normalized = normalizeLocale(locale)
  return `${LOCALE_COOKIE}=${normalized}; Path=/; Max-Age=31536000; SameSite=Lax`
}
