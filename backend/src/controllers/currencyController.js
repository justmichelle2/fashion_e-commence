const { User } = require('../models')
const {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  SUPPORTED_CURRENCY_CODES,
  STATIC_RATES,
  STATIC_RATE_SOURCE,
  normalizeCurrency,
} = require('../utils/currency')

function listCurrencies(req, res) {
  res.json({
    currencies: SUPPORTED_CURRENCIES,
    codes: SUPPORTED_CURRENCY_CODES,
    defaultCurrency: BASE_CURRENCY,
    rateSource: STATIC_RATE_SOURCE,
    rates: STATIC_RATES,
  })
}

async function updatePreferredCurrency(req, res) {
  try {
    const { preferredCurrency } = req.body || {}
    const normalized = normalizeCurrency(preferredCurrency)
    if (!normalized) {
      return res.status(400).json({ error: 'Unsupported currency' })
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'preferredCurrency', 'preferredLocale'],
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.preferredCurrency = normalized
    await user.save()

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredCurrency: user.preferredCurrency,
        preferredLocale: user.preferredLocale,
      },
      preferredCurrency: user.preferredCurrency,
    })
  } catch (err) {
    console.error('updatePreferredCurrency error', err)
    res.status(500).json({ error: 'Unable to update currency preference' })
  }
}

module.exports = {
  listCurrencies,
  updatePreferredCurrency,
}
