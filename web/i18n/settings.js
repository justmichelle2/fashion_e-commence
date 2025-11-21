export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'it', label: 'Italiano', dir: 'ltr' },
  { code: 'ja', label: '日本語', dir: 'ltr' },
  { code: 'ko', label: '한국어', dir: 'ltr' }
]

export const DEFAULT_LOCALE = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const LOCALE_STORAGE_KEY = 'luxe-preferred-locale'

export function isSupportedLocale(value) {
  if (!value) return false
  const normalized = String(value).trim().toLowerCase()
  return SUPPORTED_LOCALES.some((entry) => entry.code === normalized)
}

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  if (!value) return fallback
  const normalized = String(value).trim().toLowerCase()
  return isSupportedLocale(normalized) ? normalized : fallback
}

export function getLocaleDirection(value) {
  const match = SUPPORTED_LOCALES.find((entry) => entry.code === value)
  return match?.dir ?? 'ltr'
}
