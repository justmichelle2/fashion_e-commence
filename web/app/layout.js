import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ThemeProvider from '../components/ThemeProvider'
import { SessionProvider } from '../components/SessionProvider'
import LocaleProvider from '../components/LocaleProvider'

export const metadata = {
  title: 'Luxe Atelier',
  description: 'Global fashion marketplace for premium designers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SessionProvider>
            <LocaleProvider>
              <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
                <div className="theme-glow theme-glow--left" />
                <div className="theme-glow theme-glow--right" />
              </div>
              <div className="relative min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 py-8">{children}</main>
                <Footer />
              </div>
            </LocaleProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
