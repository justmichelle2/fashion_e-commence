import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'
import { loadMessages } from '../../lib/i18n/load-messages'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export default getRequestConfig(async ({ locale }) => {
  const candidate = normalizeLocale(locale || DEFAULT_LOCALE)
  const resolvedLocale = SUPPORTED_CODES.includes(candidate) ? candidate : DEFAULT_LOCALE
  const messages = await loadMessages(resolvedLocale)

  return {
    locale: resolvedLocale,
    messages,
  }
})
