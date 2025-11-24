import createMiddleware from 'next-intl/middleware'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/settings'

const LOCALE_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export default createMiddleware({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
