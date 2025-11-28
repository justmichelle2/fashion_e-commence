const BASE_CURRENCY = 'USD'

const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'USD • $', symbol: '$', locale: 'en-US' },
  { code: 'EUR', label: 'EUR • €', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', label: 'GBP • £', symbol: '£', locale: 'en-GB' },
  { code: 'NGN', label: 'NGN • ₦', symbol: '₦', locale: 'en-NG' },
  { code: 'CAD', label: 'CAD • CA$', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', label: 'AUD • A$', symbol: 'A$', locale: 'en-AU' },
  { code: 'JPY', label: 'JPY • ¥', symbol: '¥', locale: 'ja-JP' },
  { code: 'INR', label: 'INR • ₹', symbol: '₹', locale: 'en-IN' },
  { code: 'GHS', label: 'GHS • ₵', symbol: '₵', locale: 'en-GH' },
  { code: 'KES', label: 'KES • KSh', symbol: 'KSh', locale: 'sw-KE' },
  { code: 'ZAR', label: 'ZAR • R', symbol: 'R', locale: 'en-ZA' },
  { code: 'AED', label: 'AED • د.إ', symbol: 'د.إ', locale: 'ar-AE' },
]

const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((currency) => currency.code)

const STATIC_RATE_SOURCE = {
  type: 'static-table',
  provider: 'Open Exchange Rates snapshot',
  asOf: '2025-11-15',
  disclaimer: 'Rates relative to USD. Refresh daily once API is wired.',
}

const STATIC_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  NGN: 1355,
  CAD: 1.36,
  AUD: 1.54,
  JPY: 156,
  INR: 134,
  GHS: 15.5,
  KES: 152,
  ZAR: 18.5,
  AED: 3.67,
}

function normalizeCurrency(code) {
  if (!code) return null
  const normalized = String(code).trim().toUpperCase()
  return SUPPORTED_CURRENCY_CODES.includes(normalized) ? normalized : null
}

function isSupportedCurrency(code) {
  return Boolean(normalizeCurrency(code))
}

module.exports = {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  SUPPORTED_CURRENCY_CODES,
  STATIC_RATES,
  STATIC_RATE_SOURCE,
  normalizeCurrency,
  isSupportedCurrency,
}
