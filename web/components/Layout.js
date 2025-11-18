import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }){
  return (
    <div className="theme-shell relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
        <div className="theme-glow theme-glow--left" />
        <div className="theme-glow theme-glow--right" />
      </div>

      <div className="relative flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
