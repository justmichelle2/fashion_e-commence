export default function Footer(){
  return (
    <footer className="footer-shell w-full mt-16 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm tracking-[0.2em]">LUXE</span>
          <nav className="hidden sm:flex gap-3 text-sm text-muted">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </nav>
        </div>
        <div className="text-sm text-muted">Crafted with care • Global ateliers & bespoke experiences</div>
      </div>
    </footer>
  )
}
