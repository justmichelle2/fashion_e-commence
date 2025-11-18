const fs = require('fs/promises')
const path = require('path')
const { User } = require('../models')

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
]

const DEFAULT_LOCALE = 'en'
const LOCALE_DIR = path.join(__dirname, '..', 'locales')

function normalizeLocale(code) {
  if (!code) return DEFAULT_LOCALE
  const value = String(code).toLowerCase()
  return SUPPORTED_LOCALES.some((locale) => locale.code === value) ? value : DEFAULT_LOCALE
}

function isSupportedLocale(code) {
  if (!code) return false
  const value = String(code).toLowerCase()
  return SUPPORTED_LOCALES.some((locale) => locale.code === value)
}

async function loadMessages(locale) {
  const target = normalizeLocale(locale)
  const filePath = path.join(LOCALE_DIR, `${target}.json`)
  const fallbackPath = path.join(LOCALE_DIR, `${DEFAULT_LOCALE}.json`)

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (target !== DEFAULT_LOCALE) {
      const fallbackRaw = await fs.readFile(fallbackPath, 'utf8')
      return JSON.parse(fallbackRaw)
    }
    console.error('Failed to load locale file', target, err)
    return {}
  }
}

async function listLocales(req, res) {
  res.json({ locales: SUPPORTED_LOCALES, defaultLocale: DEFAULT_LOCALE })
}

async function getLocaleMessages(req, res) {
  try {
    const locale = normalizeLocale(req.params.locale)
    const messages = await loadMessages(locale)
    res.json({ locale, messages })
  } catch (err) {
    console.error('getLocaleMessages error', err)
    res.status(500).json({ error: 'Unable to load locale messages' })
  }
}

async function updatePreferredLocale(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { preferredLocale } = req.body || {}
  if (!preferredLocale || !isSupportedLocale(preferredLocale)) {
    return res.status(400).json({ error: 'Unsupported locale' })
  }

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'preferredLocale'],
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    user.preferredLocale = preferredLocale
    await user.save()
    res.json({ user })
  } catch (err) {
    console.error('updatePreferredLocale error', err)
    res.status(500).json({ error: 'Unable to update locale preference' })
  }
}

module.exports = {
  listLocales,
  getLocaleMessages,
  updatePreferredLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
}
