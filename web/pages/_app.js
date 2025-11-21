import NextApp from 'next/app'
import '../app/globals.css'
import ThemeProvider from '../components/ThemeProvider'
import { SessionProvider } from '../components/SessionProvider'
import LocaleProvider from '../components/LocaleProvider'
import { DEFAULT_LOCALE } from '../i18n/settings'
import { loadMessages } from '../lib/i18n/load-messages'
import { attachLocaleCookie, detectLocaleFromNodeRequest } from '../lib/i18n/node'
import { detectBrowserLocale, readLocaleFromCookies, readLocaleFromStorage, resolveLocale } from '../lib/i18n/detect-locale'

export default function App({ Component, pageProps, locale = DEFAULT_LOCALE, messages = {} }) {
  return (
    <LocaleProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}

App.getInitialProps = async (appContext) => {
  const appProps = await NextApp.getInitialProps(appContext)
  const req = appContext.ctx?.req
  const res = appContext.ctx?.res

  let locale = DEFAULT_LOCALE
  if (req) {
    locale = detectLocaleFromNodeRequest(req)
    if (res) {
      attachLocaleCookie(res, locale)
    }
  } else {
    const cookieLocale = typeof document !== 'undefined' ? readLocaleFromCookies(document.cookie || '') : ''
    const storageLocale = readLocaleFromStorage()
    const browserLocale = detectBrowserLocale()
    locale = resolveLocale({ cookieLocale, storageLocale, browserLocale })
  }

  const messages = await loadMessages(locale)

  return {
    ...appProps,
    locale,
    messages,
  }
}
