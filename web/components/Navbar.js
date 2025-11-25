'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from '@/navigation';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useLocale } from './LocaleProvider';
import { useSession } from './SessionProvider';

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', fallback: 'Home' },
  { href: '/catalog', labelKey: 'nav.catalog', fallback: 'Catalog' },
  { href: '/designers', labelKey: 'nav.designers', fallback: 'Designers' },
  { href: '/custom-order', labelKey: 'nav.customOrders', fallback: 'Custom Orders' },
  { href: '/profile', labelKey: 'nav.profile', fallback: 'Profile' },
];

function LocaleSwitcher({ locale, locales, label, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          className="appearance-none rounded-full border border-black/40 bg-black px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:bg-black dark:text-white dark:border-white/40"
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
  );
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
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale, availableLocales, changeLocale } = useLocale();
  const { user, logout } = useSession();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const localeOptions = useMemo(() => {
    if (availableLocales && availableLocales.length) return availableLocales;
    return [{ code: 'en', label: 'English' }];
  }, [availableLocales]);

  const navItems = useMemo(
    () => NAV_LINKS.map((item) => ({ ...item, label: t(item.labelKey, item.fallback) })),
    [t]
  );

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

  const desktopActions = (
    <div className="hidden md:flex items-center gap-3">
      <LocaleSwitcher locale={locale} locales={localeOptions} onChange={changeLocale} label={t('common.language', 'Language')} />
      <ThemeToggle />
      {user ? (
        <>
          <Link href="/profile" className="btn-secondary">{user.name || 'Profile'}</Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
          <Link href="/cart" className="btn-primary gap-3"><CartIcon />{t('nav.cart', 'Cart')}</Link>
        </>
      ) : (!isAuthPage && mounted) ? (
        <Link href="/login" className="btn-secondary">{t('actions.signIn', 'Sign in')}</Link>
      ) : null}
    </div>
  );

  const mobileLocaleSwitcher = (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.3em] text-muted">{t('common.language', 'Language')}</span>
      <LocaleSwitcher locale={locale} locales={localeOptions} onChange={changeLocale} label={t('common.language', 'Language')} />
    </div>
  );

  return (
    <header className="nav-shell w-full sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="text-2xl font-serif tracking-[0.2em]">LUXE</Link>
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
            ))}
          </nav>
        )}
        {desktopActions}
        <button className="md:hidden p-2" aria-label={t('nav.menu', 'Menu')} onClick={() => setOpen((p) => !p)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden" style={{ background: 'var(--body-bg)', borderTop: `1px solid var(--card-border)` }}>
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">{t('common.mode', 'Mode')}</span>
              <ThemeToggle />
            </div>
            {mobileLocaleSwitcher}
            {user && navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block" onClick={() => setOpen(false)}>{item.label}</Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link href="/profile" className="btn-secondary w-1/2 text-center" onClick={() => setOpen(false)}>{user.name || 'Profile'}</Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="btn-secondary w-1/2">Logout</button>
                </>
              ) : (!isAuthPage && mounted) ? (
                <Link href="/login" className="btn-secondary w-full text-center" onClick={() => setOpen(false)}>{t('actions.signIn', 'Sign in')}</Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
