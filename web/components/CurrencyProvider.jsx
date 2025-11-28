'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  BASE_CURRENCY,
  CURRENCY_STORAGE_KEY,
  SUPPORTED_CURRENCIES,
  STATIC_RATES,
  STATIC_RATE_SOURCE,
  normalizeCurrency,
  formatCurrency as formatCurrencyValue,
} from '@/lib/currency'
import { getCurrencies } from '@/lib/api'

const CurrencyContext = createContext(null)
CurrencyContext.displayName = 'CurrencyContext'

export default function CurrencyProvider({
  children,
  initialCurrency = BASE_CURRENCY,
  initialRates = STATIC_RATES,
}) {
  const [currency, setCurrency] = useState(() => normalizeCurrency(initialCurrency) || BASE_CURRENCY)
  const [rates, setRates] = useState(initialRates)
  const [supportedCurrencies, setSupportedCurrencies] = useState(SUPPORTED_CURRENCIES)
  const [rateSource, setRateSource] = useState(STATIC_RATE_SOURCE)
  const [status, setStatus] = useState('loading')
  const userOverrideRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored) {
      const normalized = normalizeCurrency(stored)
      if (normalized) {
        setCurrency(normalized)
        userOverrideRef.current = true
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function bootstrapCurrency() {
      try {
        setStatus('loading')
        const payload = await getCurrencies()
        if (!isMounted) return
        if (Array.isArray(payload?.currencies) && payload.currencies.length) {
          setSupportedCurrencies(payload.currencies)
        }
        if (payload?.rates && typeof payload.rates === 'object') {
          setRates((prev) => ({ ...prev, ...payload.rates }))
        }
        if (payload?.rateSource) {
          setRateSource(payload.rateSource)
        }
        const serverDefault = normalizeCurrency(payload?.defaultCurrency)
        if (serverDefault && !userOverrideRef.current) {
          setCurrency(serverDefault)
        }
        setStatus('ready')
      } catch (err) {
        console.warn('Unable to load live currency metadata, falling back to static table', err)
        if (isMounted) {
          setStatus('degraded')
        }
      }
    }
    bootstrapCurrency()
    return () => {
      isMounted = false
    }
  }, [])

  const persistChoice = useCallback((nextCode) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCode)
    document.cookie = `currency=${nextCode};path=/;max-age=${60 * 60 * 24 * 365}`
  }, [])

  const changeCurrency = useCallback(
    (nextCode) => {
      const normalized = normalizeCurrency(nextCode)
      if (!normalized) return currency
      if (normalized === currency) return currency
      setCurrency(normalized)
      userOverrideRef.current = true
      persistChoice(normalized)
      return normalized
    },
    [currency, persistChoice],
  )

  const convert = useCallback(
    (amountCents = 0, { from = BASE_CURRENCY, to = currency } = {}) => {
      const safeAmount = typeof amountCents === 'number' ? amountCents : 0
      const fromCode = normalizeCurrency(from) || BASE_CURRENCY
      const toCode = normalizeCurrency(to) || BASE_CURRENCY
      if (fromCode === toCode) return safeAmount
      const fromRate = rates[fromCode] ?? 1
      const toRate = rates[toCode] ?? 1
      const amountInBase = fromCode === BASE_CURRENCY ? safeAmount : safeAmount / fromRate
      return Math.round(amountInBase * toRate)
    },
    [currency, rates],
  )

  const format = useCallback(
    (amountCents = 0, options = {}) => {
      const targetCurrency = normalizeCurrency(options.currency) || currency
      const sourceCurrency = normalizeCurrency(options.fromCurrency) || BASE_CURRENCY
      const locale =
        options.locale ||
        supportedCurrencies.find((entry) => entry.code === targetCurrency)?.locale ||
        'en-US'
      const cents =
        options.skipConversion || sourceCurrency === targetCurrency
          ? amountCents
          : convert(amountCents, { from: sourceCurrency, to: targetCurrency })
      return formatCurrencyValue(cents, targetCurrency, locale)
    },
    [convert, currency],
  )

  const value = useMemo(
    () => ({
      currency,
      rates,
      status,
      supportedCurrencies,
      rateSource,
      changeCurrency,
      convert,
      format,
      setRates,
    }),
    [currency, rates, status, changeCurrency, convert, format, supportedCurrencies, rateSource],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
