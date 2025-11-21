"use client"

import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { useLocale } from './LocaleProvider'

export default function ThemeToggle(){
  const { theme, toggleTheme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === 'dark' : false
  const icon = !mounted ? '•' : isDark ? '🌙' : '☀️'
  const baseLabel = t('theme.label', 'Theme')
  const label = !mounted ? baseLabel : isDark ? t('theme.night', 'Night') : t('theme.day', 'Day')

  return (
    <button
      type="button"
      aria-label={t('theme.toggle', 'Toggle color theme')}
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'} bg-white/10 hover:bg-white/20 dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-500 dark:hover:from-purple-500 dark:hover:to-purple-400 transition-colors`}
      onClick={toggleTheme}
      disabled={!mounted}
    >
      <span className="theme-toggle__icon" aria-live="polite">
        {icon}
      </span>
      <span className="theme-toggle__label">{label}</span>
      <span className="theme-toggle__pill" />
    </button>
  )
}
