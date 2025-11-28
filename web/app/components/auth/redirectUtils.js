import { SUPPORTED_LOCALES } from '@/i18n/settings'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export function normalizeRedirectTarget(value, fallback = '/profile') {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/')) return fallback

  try {
    const url = new URL(value, 'https://luxe.local')
    const normalizedPath = stripLocaleFromPath(url.pathname)
    return `${normalizedPath}${url.search}${url.hash}` || fallback
  } catch (error) {
    return fallback
  }
}

function stripLocaleFromPath(pathname = '/') {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length && SUPPORTED_CODES.includes(segments[0])) {
    segments.shift()
  }
  if (segments.length === 0) {
    return '/'
  }
  return `/${segments.join('/')}`
}
