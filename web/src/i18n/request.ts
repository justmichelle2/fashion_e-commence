import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'
import { loadMessages } from '../../lib/i18n/load-messages'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export default getRequestConfig(async ({ locale }) => {
  const normalized = normalizeLocale(locale)
  const resolvedLocale = SUPPORTED_CODES.includes(normalized) ? normalized : DEFAULT_LOCALE

  return {
    locale: resolvedLocale,
    messages: await loadMessages(resolvedLocale),
  }
})
