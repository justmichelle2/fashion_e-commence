import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_LOCALE, normalizeLocale } from '../i18n/settings'

function coerceLocale(value) {
  if (!value) return null
  const trimmed = value.split(';')[0].trim().toLowerCase()
  if (!trimmed) return null
  const [base] = trimmed.split('-')
  const normalized = normalizeLocale(base || trimmed, DEFAULT_LOCALE)
  return normalized
}

function resolvePreferredLocale() {
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (cookieLocale) {
    return normalizeLocale(cookieLocale, DEFAULT_LOCALE)
  }

  const acceptLanguage = headers().get('accept-language')
  if (acceptLanguage) {
    const [preferred] = acceptLanguage.split(',')
    const normalized = coerceLocale(preferred)
    if (normalized) return normalized
  }

  return DEFAULT_LOCALE
}

export default function LoginRedirectPage({ searchParams }) {
  const locale = resolvePreferredLocale()
  const query = new URLSearchParams(searchParams || {}).toString()
  const destination = `/${locale}/login${query ? `?${query}` : ''}`
  redirect(destination)
}
