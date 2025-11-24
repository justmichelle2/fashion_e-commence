import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ThemeProvider from '../../components/ThemeProvider'
import { SessionProvider } from '../../components/SessionProvider'
import LocaleProvider from '../../components/LocaleProvider'
import { lookupLocaleMetadata } from '../../lib/i18n/server'
import { loadMessages } from '../../lib/i18n/load-messages'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from '../../i18n/settings'
import { unstable_setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../../src/i18n/request'

const SUPPORTED_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export function generateStaticParams() {
  return SUPPORTED_CODES.map((locale) => ({ locale }))
}

export const dynamicParams = false

export default async function LocaleLayout({ children, params }) {
  const requested = normalizeLocale(params?.locale, DEFAULT_LOCALE)
  if (!SUPPORTED_CODES.includes(requested)) {
    notFound()
  }

  unstable_setRequestLocale(requested)
  const messages = await loadMessages(requested)
  const { dir } = lookupLocaleMetadata(requested)

  return (
    <html lang={requested} dir={dir}>
      <body>
        <LocaleProvider locale={requested} messages={messages}>
          <ThemeProvider>
            <SessionProvider>
              <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
                <div className="theme-glow theme-glow--left" />
                <div className="theme-glow theme-glow--right" />
              </div>
              <div className="relative min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 py-8">{children}</main>
                <Footer />
              </div>
            </SessionProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
