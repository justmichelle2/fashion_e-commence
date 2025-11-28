import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'
import { loadMessages } from '../../lib/i18n/load-messages'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)
const isDev = process.env.NODE_ENV !== 'production'

export default getRequestConfig(async ({ locale }) => {
  const normalized = normalizeLocale(locale)
  const resolvedLocale = SUPPORTED_CODES.includes(normalized) ? normalized : DEFAULT_LOCALE
  const messages = await loadMessages(resolvedLocale)

  return {
    locale: resolvedLocale,
    messages,
    getMessageFallback({ key, namespace }) {
      const normalizedKey = Array.isArray(key) ? key.join('.') : key
      if (isDev) {
        console.warn(`Missing message: ${namespace ? `${namespace}.` : ''}${normalizedKey}`)
      }
      return normalizedKey
    },
    onError(error) {
      if (isDev) {
        console.warn('intl error:', error)
      }
    },
  }
})
