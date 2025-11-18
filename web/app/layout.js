import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ThemeProvider from '../components/ThemeProvider'
import { SessionProvider } from '../components/SessionProvider'

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
          <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
            <div className="theme-glow theme-glow--left" />
            <div className="theme-glow theme-glow--right" />
          </div>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
