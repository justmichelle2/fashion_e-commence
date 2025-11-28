'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'luxe-wishlist-items'

function normalizeProduct(product = {}) {
  const rawId = product.id ?? product.slug ?? product.handle
  if (!rawId) return null
  const priceCents =
    typeof product.priceCents === 'number'
      ? product.priceCents
      : typeof product.price === 'number'
      ? Math.round(product.price * 100)
      : null

  return {
    id: rawId,
    title: product.title || product.name || 'Untitled Couture',
    priceCents,
    currency: product.currency || 'USD',
    image: product.image || product.images?.[0] || null,
    availability: product.availability || null,
    category: product.category || null,
    designer: product.designer || null,
  }
}

const WishlistContext = createContext(null)
WishlistContext.displayName = 'WishlistContext'

export default function WishlistProvider({ children }) {
  const [items, setItems] = useState([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((entry) => entry?.id))
        }
      }
    } catch (err) {
      console.warn('Wishlist load failed', err)
    } finally {
      setHydrated(true)
    }
  }, [])

  const updateItems = useCallback((updater) => {
    setItems((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch (err) {
          console.warn('Wishlist persist failed', err)
        }
      }
      return next
    })
  }, [])

  const toggle = useCallback(
    (product) => {
      const normalized = normalizeProduct(product)
      if (!normalized) return
      updateItems((prev) => {
        const exists = prev.some((entry) => entry.id === normalized.id)
        if (exists) {
          return prev.filter((entry) => entry.id !== normalized.id)
        }
        return [...prev, normalized]
      })
    },
    [updateItems],
  )

  const remove = useCallback(
    (id) => {
      if (!id) return
      updateItems((prev) => prev.filter((entry) => entry.id !== id))
    },
    [updateItems],
  )

  const clear = useCallback(() => updateItems([]), [updateItems])

  const likedIds = useMemo(() => new Set(items.map((entry) => entry.id)), [items])

  const value = useMemo(
    () => ({
      items,
      hydrated,
      toggle,
      remove,
      clear,
      count: items.length,
      isLiked: (id) => (id ? likedIds.has(id) : false),
    }),
    [items, hydrated, toggle, remove, clear, likedIds],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
