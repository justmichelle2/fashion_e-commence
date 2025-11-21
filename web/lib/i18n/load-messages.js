import { DEFAULT_LOCALE, normalizeLocale } from '../../i18n/settings'

export async function loadMessages(locale) {
  const normalized = normalizeLocale(locale)
  try {
    const messages = (await import(`../../src/messages/${normalized}.json`)).default
    return messages
  } catch (error) {
    if (normalized !== DEFAULT_LOCALE) {
      const fallback = (await import(`../../src/messages/${DEFAULT_LOCALE}.json`)).default
      return fallback
    }
    console.warn(`Missing translation bundle for ${normalized}`)
    return {}
  }
}
