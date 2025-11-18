'use client'
import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  return (
    <header className="nav-shell w-full sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="text-2xl font-serif tracking-[0.2em]">LUXE</Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/catalog" className="nav-link">Catalog</Link>
          <Link href="/designers" className="nav-link">Designers</Link>
          <Link href="/custom-order" className="nav-link">Custom Orders</Link>
          <Link href="/profile" className="nav-link">Profile</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary">Sign in</Link>
          <Link href="/cart" className="btn-primary">Cart</Link>
        </div>

        <button className="md:hidden p-2" aria-label="menu" onClick={()=>setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden" style={{ background: 'var(--body-bg)', borderTop: `1px solid var(--card-border)` }}>
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Mode</span>
              <ThemeToggle />
            </div>
            <Link href="/" className="block" onClick={()=>setOpen(false)}>Home</Link>
            <Link href="/catalog" className="block" onClick={()=>setOpen(false)}>Catalog</Link>
            <Link href="/designers" className="block" onClick={()=>setOpen(false)}>Designers</Link>
            <Link href="/custom-order" className="block" onClick={()=>setOpen(false)}>Custom Orders</Link>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-secondary w-1/2 text-center" onClick={()=>setOpen(false)}>Sign in</Link>
              <Link href="/cart" className="btn-primary w-1/2 text-center" onClick={()=>setOpen(false)}>Cart</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
