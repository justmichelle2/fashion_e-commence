import { normalizeLocale } from '../../i18n/settings'
import { detectFromAcceptLanguage, readLocaleFromCookies, resolveLocale, serializeLocaleCookie } from './detect-locale'

export function detectLocaleFromNodeRequest(req) {
  const cookieLocale = readLocaleFromCookies(req?.headers?.cookie || '')
  const acceptLanguage = req?.headers?.['accept-language'] || ''
  const locale = resolveLocale({ cookieLocale, acceptLanguage })
  return normalizeLocale(locale)
}

export function attachLocaleCookie(res, locale) {
  if (!res || typeof res.setHeader !== 'function') return
  const normalized = normalizeLocale(locale)
  const existing = res.getHeader?.('Set-Cookie')
  const serialized = serializeLocaleCookie(normalized)
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, serialized])
  } else if (existing) {
    res.setHeader('Set-Cookie', [existing, serialized])
  } else {
    res.setHeader('Set-Cookie', serialized)
  }
}
