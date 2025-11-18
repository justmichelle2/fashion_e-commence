'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useLocale } from './LocaleProvider'

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', fallback: 'Home' },
  { href: '/catalog', labelKey: 'nav.catalog', fallback: 'Catalog' },
  { href: '/designers', labelKey: 'nav.designers', fallback: 'Designers' },
  { href: '/custom-order', labelKey: 'nav.customOrders', fallback: 'Custom Orders' },
  { href: '/profile', labelKey: 'nav.profile', fallback: 'Profile' },
]

function LocaleSwitcher({ locale, locales, label, onChange }) {
  const handleChange = useCallback(
    (event) => {
      onChange(event.target.value)
    },
    [onChange],
  )

  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          className="appearance-none rounded-full border border-border/50 bg-card/60 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em]"
          value={locale}
          onChange={handleChange}
        >
          {locales.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">⌄</span>
      </div>
    </label>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { t, locale, availableLocales, changeLocale } = useLocale()

  const localeOptions = useMemo(() => {
    if (availableLocales && availableLocales.length) return availableLocales
    return [{ code: 'en', label: 'English' }]
  }, [availableLocales])

  const navItems = useMemo(
    () => NAV_LINKS.map((item) => ({ ...item, label: t(item.labelKey, item.fallback) })),
    [t],
  )

  const desktopActions = (
    <div className="hidden md:flex items-center gap-3">
      <LocaleSwitcher
        locale={locale}
        locales={localeOptions}
        onChange={(next) => changeLocale(next)}
        label={t('common.language', 'Language')}
      />
      <ThemeToggle />
      <Link href="/login" className="btn-secondary">
        {t('actions.signIn', 'Sign in')}
      </Link>
      <Link href="/cart" className="btn-primary">
        {t('nav.cart', 'Cart')}
      </Link>
    </div>
  )

  const mobileLocaleSwitcher = (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.3em] text-muted">{t('common.language', 'Language')}</span>
      <LocaleSwitcher locale={locale} locales={localeOptions} onChange={(next) => changeLocale(next)} label={t('common.language', 'Language')} />
    </div>
  )

  return (
    <header className="nav-shell w-full sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="text-2xl font-serif tracking-[0.2em]">
          LUXE
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {desktopActions}

        <button className="md:hidden p-2" aria-label="menu" onClick={() => setOpen((prev) => !prev)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden" style={{ background: 'var(--body-bg)', borderTop: `1px solid var(--card-border)` }}>
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Mode</span>
              <ThemeToggle />
            </div>
            {mobileLocaleSwitcher}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-secondary w-1/2 text-center" onClick={() => setOpen(false)}>
                {t('actions.signIn', 'Sign in')}
              </Link>
              <Link href="/cart" className="btn-primary w-1/2 text-center" onClick={() => setOpen(false)}>
                {t('nav.cart', 'Cart')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
