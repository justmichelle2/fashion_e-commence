"use client"
import { useTheme } from './ThemeProvider'

export default function ThemeToggle(){
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__icon">{isDark ? '🌙' : '☀️'}</span>
      <span className="theme-toggle__label">{isDark ? 'Night' : 'Day'}</span>
      <span className="theme-toggle__pill" />
    </button>
  )
}
