import { BASE_CURRENCY, formatCurrency as formatCurrencyValue, normalizeCurrency } from '@/lib/currency'

export function getNumericPrice(product) {
  if (!product) return 0
  if (typeof product.price === 'number') return product.price
  if (typeof product.priceCents === 'number') return product.priceCents / 100
  return 0
}

export function formatPrice(product, fallbackCurrency = 'USD') {
  const amount = getNumericPrice(product)
  const currency = product?.currency || fallbackCurrency
  return formatCurrencyValue(Math.round(amount * 100), normalizeCurrency(currency) || BASE_CURRENCY)
}

export function formatMoney(amountCents = 0, currency = 'USD') {
  const safeCurrency = normalizeCurrency(currency) || BASE_CURRENCY
  return formatCurrencyValue(typeof amountCents === 'number' ? amountCents : 0, safeCurrency)
}
