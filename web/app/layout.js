import './globals.css'
import { DEFAULT_LOCALE, normalizeLocale } from '../i18n/settings'
import { lookupLocaleMetadata } from '../lib/i18n/server'

export const metadata = {
  title: 'Luxe Atelier',
  description: 'Global fashion marketplace for premium designers',
}

export default function RootLayout({ children, params = {} }) {
  const locale = normalizeLocale(params?.locale, DEFAULT_LOCALE)
  const { dir } = lookupLocaleMetadata(locale)

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
