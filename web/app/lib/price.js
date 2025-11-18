const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
}

export function getNumericPrice(product) {
  if (!product) return 0
  if (typeof product.price === 'number') return product.price
  if (typeof product.priceCents === 'number') return product.priceCents / 100
  return 0
}

export function formatPrice(product, fallbackCurrency = 'USD') {
  const amount = getNumericPrice(product)
  const currency = product?.currency || fallbackCurrency
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `
  return `${symbol}${amount.toFixed(2)}`
}

export function formatMoney(amountCents = 0, currency = 'USD') {
  const safeCents = typeof amountCents === 'number' ? amountCents : 0
  const amount = safeCents / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (err) {
    return `${currency} ${amount.toFixed(2)}`
  }
}
