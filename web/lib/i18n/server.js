import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'
import { resolveLocale } from './detect-locale'

export function resolveActiveLocale() {
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value || ''
  const acceptLanguage = headers().get('accept-language') || ''
  const locale = resolveLocale({ cookieLocale, acceptLanguage })
  return normalizeLocale(locale)
}

export function lookupLocaleMetadata(locale) {
  const normalized = normalizeLocale(locale)
  return SUPPORTED_LOCALES.find((entry) => entry.code === normalized) ?? {
    code: DEFAULT_LOCALE,
    dir: 'ltr',
    label: '한국어',
  }
}
