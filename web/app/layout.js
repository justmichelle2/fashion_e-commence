import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ThemeProvider from '../components/ThemeProvider'
import { SessionProvider } from '../components/SessionProvider'
import LocaleProvider from '../components/LocaleProvider'
import { detectRequestLocale, getLocaleMetadata } from '../lib/i18n/server'
import { loadMessages } from '../lib/i18n/load-messages'

export const metadata = {
  title: 'Luxe Atelier',
  description: 'Global fashion marketplace for premium designers',
}

export default async function RootLayout({ children }) {
  const locale = detectRequestLocale()
  const messages = await loadMessages(locale)
  const { dir } = getLocaleMetadata(locale)

  return (
    <html lang={locale} dir={dir}>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
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
