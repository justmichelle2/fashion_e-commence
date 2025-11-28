'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useRouter } from '@/navigation'
import ThemeToggle from './ThemeToggle'
import { useLocale } from './LocaleProvider'
import { useCurrency } from './CurrencyProvider'
import { useSession } from './SessionProvider'

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', fallback: 'Home' },
  { href: '/catalog', labelKey: 'nav.catalog', fallback: 'Catalog' },
  { href: '/designers', labelKey: 'nav.designers', fallback: 'Designers' },
  { href: '/custom-order', labelKey: 'nav.customOrders', fallback: 'Custom Orders' },
  { href: '/profile', labelKey: 'nav.profile', fallback: 'Profile' },
]

function LocaleSwitcher({ locale, locales, label, onChange }) {
  const handleChange = useCallback((event) => onChange(event.target.value), [onChange])

  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          className="appearance-none rounded-full border border-purple-600 bg-purple-600 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 dark:border-white/40 dark:bg-black dark:text-white"
          value={locale}
          onChange={handleChange}
        >
          {locales.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-white/80">⌄</span>
      </div>
    </label>
  )
}

function CurrencySwitcher({ label }) {
  const { currency, supportedCurrencies, changeCurrency } = useCurrency()
  const handleChange = useCallback((event) => changeCurrency(event.target.value), [changeCurrency])

  if (!supportedCurrencies?.length) return null

  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          className="appearance-none rounded-full border border-purple-300 bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-purple-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:border-white/40 dark:bg-black dark:text-white dark:focus-visible:ring-2 dark:focus-visible:ring-white/40"
          value={currency}
          onChange={handleChange}
        >
          {supportedCurrencies.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-purple-500 dark:text-white">
          ⌄
        </span>
      </div>
    </label>
  )
}

function CartIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H7" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3.5 6l4.5 4 4.5-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  )
}

export default function Navbar() {
  const router = useRouter()
  const { t, locale, availableLocales, changeLocale } = useLocale()
  const currencyLabel = t('currency.label', 'Currency')
  const { user, logout, status } = useSession()
  const waitingForSession = status === 'idle' || status === 'loading'

  const [searchQuery, setSearchQuery] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const localeOptions = useMemo(() => {
    if (availableLocales && availableLocales.length) return availableLocales
    return [{ code: 'en', label: 'English' }]
  }, [availableLocales])

  const navItems = useMemo(
    () => NAV_LINKS.map((item) => ({ ...item, label: t(item.labelKey, item.fallback) })),
    [t],
  )

  const canAccessFullNav = status === 'authenticated' && Boolean(user)
  const isGuest = status === 'unauthenticated'
  const showSignInLink = !canAccessFullNav
  const signInHref = '/login'
  const signInLabel = waitingForSession ? t('loading Session', 'Loading session…') : t('actions.signIn', 'Sign in')

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault()
      if (!canAccessFullNav) return
      const term = searchQuery.trim()
      if (!term) return
      router.push(`/search?query=${encodeURIComponent(term)}`)
    },
    [canAccessFullNav, searchQuery, router],
  )

  const handleLogout = useCallback(() => {
    logout()
    setProfileMenuOpen(false)
  }, [logout])

  return (
    <header className="nav-shell sticky top-0 z-30 w-full backdrop-blur">
      <div className="border-b border-white/10 bg-[var(--body-bg)]/85">
        <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-serif tracking-[0.3em]">
            LUXE ATELIER
          </Link>

          {canAccessFullNav && (
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] max-w-2xl">
              <label htmlFor="global-search" className="sr-only">
                {t('nav.searchLabel', 'Search couture, designers, fabrics')}
              </label>
              <div className="relative">
                <input
                  id="global-search"
                  className="w-full rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-sm text-purple-950 placeholder:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/60 dark:focus-visible:ring-white/50"
                  placeholder={t('search LUXE', 'Search cloth, designers, capsules...')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 dark:bg-white/20 dark:text-white dark:hover:bg-white/30 dark:focus-visible:ring-white/60"
                  aria-label={t('nav.search', 'Search')}
                >
                  <SearchIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">{t('nav.search', 'Search')}</span>
                </button>
              </div>
            </form>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <LocaleSwitcher
              locale={locale}
              locales={localeOptions}
              onChange={changeLocale}
              label={t('common.language', 'Language')}
            />
            <CurrencySwitcher label={currencyLabel} />
            <ThemeToggle />

            {canAccessFullNav ? (
              <>
                <Link
                  href="/cart"
                  className="btn-secondary flex items-center gap-2 text-xs"
                  aria-label={t('nav.cart', 'Cart')}
                >
                  <CartIcon className="h-4 w-4" />
                  <span>{t('nav.cart', 'Cart')}</span>
                </Link>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                  >
                    <span>{user?.name || t('nav.profile', 'Profile')}</span>
                    <ChevronIcon open={profileMenuOpen} />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[var(--card-bg)] p-3 shadow-xl">
                      <Link
                        href="/profile"
                        className="block rounded-xl px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/80 hover:bg-white/10"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        {t('nav.profile', 'Profile')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.25em] text-rose-300 hover:bg-white/5"
                      >
                        {t('logout', 'Logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : showSignInLink ? (
              <Link
                href={signInHref}
                className="btn-secondary text-[10px] uppercase tracking-[0.25em]"
                aria-busy={waitingForSession}
              >
                {signInLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {canAccessFullNav && (
        <div className="border-b border-white/10 bg-purple-50 dark:bg-white/5">
          <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex gap-6 overflow-x-auto text-xs uppercase tracking-[0.25em] text-muted">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link whitespace-nowrap">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
