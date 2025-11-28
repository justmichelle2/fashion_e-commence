import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useLocale } from '../../components/LocaleProvider'
import { useCurrency } from '../../components/CurrencyProvider'
import { useSession } from '../../components/SessionProvider'
import api, { API_BASE } from '../../utils/api'

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const DEFAULT_COLORS = ['Porcelain', 'Obsidian', 'Emerald']
const VIDEO_EXPERIENCE_ID = 'atelier-video'
const CHAT_EXPERIENCE_ID = 'concierge-chat'

export default function ProductPage(){
  const { t } = useLocale()
  const { format } = useCurrency()
  const { user, token } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [vipCatalog, setVipCatalog] = useState([])
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZES[2])
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  const [quantity, setQuantity] = useState(1)
  const [videoState, setVideoState] = useState('idle')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [conciergeOrderId, setConciergeOrderId] = useState(null)
  const [isEnsuringThread, setIsEnsuringThread] = useState(false)
  const [vipRequests, setVipRequests] = useState([])
  const [vipRequestFeedback, setVipRequestFeedback] = useState(null)
  const [isRequestingVip, setIsRequestingVip] = useState(false)
  const pollRef = useRef(null)

  const grantedVipIds = useMemo(
    () => (Array.isArray(user?.notificationPrefs?.vipExperiences) ? user.notificationPrefs.vipExperiences : []),
    [user],
  )

  const strings = useMemo(
    () => ({
      loading: t('pages.product.loading', 'Loading product…'),
      priceLabel: t('pages.product.priceLabel', 'Price'),
      detailsTitle: t('pages.product.detailsTitle', 'Design Details'),
      sizeLabel: t('pages.product.sizeLabel', 'Select size'),
      colorLabel: t('pages.product.colorLabel', 'Color story'),
      quantityLabel: t('pages.product.quantityLabel', 'Looks to reserve'),
      addToBag: t('pages.product.addToBag', 'Add to atelier cart'),
      conciergeTitle: t('pages.product.conciergeTitle', 'Concierge experiences'),
      videoCallCta: t('pages.product.videoCallCta', 'Join video atelier'),
      chatCta: t('pages.product.chatCta', 'Drop a chat note'),
      vipTitle: t('pages.product.vipTitle', 'VIP access'),
      vipRequest: t('pages.product.vipRequest', 'Request VIP invite'),
      chatPlaceholder: t('pages.product.chatPlaceholder', 'Ask about fit, delivery, or custom tweaks…'),
      chatSend: t('pages.product.chatSend', 'Send'),
      vipRequestSuccess: t('pages.product.vipRequestSuccess', 'Request sent. A concierge will respond shortly.'),
      vipRequestLogin: t('pages.product.vipRequestLogin', 'Sign in to request VIP access.'),
      chatLogin: t('pages.product.chatLogin', 'Sign in to chat with the atelier team.'),
      chatError: t('pages.product.chatError', 'Unable to send message right now.'),
      videoPending: t('pages.product.videoPending', 'Awaiting admin approval for video room.'),
      videoGranted: t('pages.product.videoGranted', 'Video room unlocked. Tap to join.'),
      videoLocked: t('pages.product.videoLocked', 'Request a VIP slot to go live.'),
    }),
    [t],
  )

  useEffect(() => {
    if (!id) return
    let mounted = true
    api
      .getProduct(id)
      .then((p) => {
        if (mounted && p) {
          setProduct(p)
          setChatMessages([
            {
              id: 'welcome',
              sender: 'Concierge',
              message: `Welcome to the atelier. Let’s tailor ${p.title} together.`,
              timestamp: new Date().toISOString(),
            },
          ])
        }
      })
      .catch((err) => console.warn('Product load failed', err.message))
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    let mounted = true
    api
      .listVipExperiences()
      .then((experiences) => {
        if (mounted) setVipCatalog(experiences)
      })
      .catch((err) => console.warn('vip load error', err.message))
    return () => {
      mounted = false
    }
  }, [])

  const authedJson = useCallback(
    async (path, { method = 'GET', body, headers: extraHeaders } = {}) => {
      if (!token) throw new Error('Authentication required')
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(extraHeaders || {}),
        },
        body,
      })
      const text = await res.text()
      if (!res.ok) {
        throw new Error(text || 'Request failed')
      }
      if (!text) return null
      try {
        return JSON.parse(text)
      } catch (err) {
        return text
      }
    },
    [token],
  )

  const refreshVipRequests = useCallback(async () => {
    if (!token) {
      setVipRequests([])
      return
    }
    try {
      const payload = await authedJson('/api/vip/requests/me')
      setVipRequests(payload?.requests || [])
    } catch (err) {
      console.warn('vip request fetch error', err.message)
    }
  }, [token, authedJson])

  useEffect(() => {
    refreshVipRequests()
  }, [refreshVipRequests])

  const clampQuantity = useCallback((value) => Math.min(10, Math.max(1, value)), [])

  const handleQuantityChange = useCallback(
    (next) => {
      const numeric = Number(next)
      if (Number.isNaN(numeric)) return
      setQuantity(clampQuantity(numeric))
    },
    [clampQuantity],
  )

  const handleQuantityStep = useCallback(
    (delta) => {
      setQuantity((prev) => clampQuantity(prev + delta))
    },
    [clampQuantity],
  )

  const requireLogin = useCallback(() => {
    if (token) return true
    router.push(`/account/login?redirect=${encodeURIComponent(router.asPath)}`)
    return false
  }, [token, router])

  const loadMessages = useCallback(
    async (orderId, { quiet = false } = {}) => {
      if (!token || !orderId) return
      if (!quiet) setChatLoading(true)
      try {
        const payload = await authedJson(`/api/chat/${orderId}`)
        setChatMessages(payload?.messages || [])
        setChatError(null)
      } catch (err) {
        if (!quiet) setChatError(err.message || strings.chatError)
        throw err
      } finally {
        if (!quiet) setChatLoading(false)
      }
    },
    [token, authedJson, strings.chatError],
  )

  const storageKey = product ? `concierge:${product.id}` : null

  const ensureConciergeOrder = useCallback(async () => {
    if (!product) return null
    if (!requireLogin()) return null
    if (conciergeOrderId) return conciergeOrderId
    setIsEnsuringThread(true)
    try {
      if (storageKey && typeof window !== 'undefined') {
        const storedId = window.localStorage.getItem(storageKey)
        if (storedId) {
          try {
            await loadMessages(storedId)
            setConciergeOrderId(storedId)
            return storedId
          } catch (err) {
            window.localStorage.removeItem(storageKey)
          }
        }
      }

      const payload = await authedJson('/api/custom-orders', {
        method: 'POST',
        body: JSON.stringify({
          title: `Concierge • ${product.title}`,
          description: product.description?.slice(0, 240) || 'Concierge styling request',
          notes: `Concierge interest for product ${product.id}`,
          inspirationImages: (product.images || []).slice(0, 3),
        }),
      })
      const newId = payload?.order?.id
      if (!newId) throw new Error('Unable to create concierge request')
      setConciergeOrderId(newId)
      setChatMessages([])
      if (storageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, newId)
      }
      return newId
    } finally {
      setIsEnsuringThread(false)
    }
  }, [product, requireLogin, conciergeOrderId, authedJson, loadMessages, storageKey])

  useEffect(() => {
    if (!token || !product || conciergeOrderId) return
    if (!storageKey || typeof window === 'undefined') return
    const cachedId = window.localStorage.getItem(storageKey)
    if (!cachedId) return
    loadMessages(cachedId)
      .then(() => setConciergeOrderId(cachedId))
      .catch(() => window.localStorage.removeItem(storageKey))
  }, [token, product, conciergeOrderId, storageKey, loadMessages])

  useEffect(() => {
    if (!token || !conciergeOrderId) return
    loadMessages(conciergeOrderId, { quiet: true })
    pollRef.current = setInterval(() => {
      loadMessages(conciergeOrderId, { quiet: true }).catch(() => {})
    }, 8000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [token, conciergeOrderId, loadMessages])

  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() || chatLoading || isEnsuringThread) return
    if (!requireLogin()) return
    try {
      const orderId = await ensureConciergeOrder()
      if (!orderId) return
      setChatInput('')
      await authedJson(`/api/chat/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ message: chatInput.trim() }),
      })
      await loadMessages(orderId, { quiet: true })
    } catch (err) {
      setChatError(err.message || strings.chatError)
    }
  }, [chatInput, chatLoading, isEnsuringThread, requireLogin, ensureConciergeOrder, authedJson, loadMessages, strings.chatError])

  const handleVipRequest = useCallback(
    async (experienceId) => {
      if (!experienceId) return
      if (!requireLogin()) {
        setVipRequestFeedback({ type: 'error', text: strings.vipRequestLogin })
        return
      }
      setIsRequestingVip(true)
      setVipRequestFeedback(null)
      try {
        await authedJson('/api/vip/requests', {
          method: 'POST',
          body: JSON.stringify({
            experienceId,
            productId: product?.id,
            productTitle: product?.title,
            notes: `Requested from ${product?.title}`,
          }),
        })
        setVipRequestFeedback({ type: 'success', text: strings.vipRequestSuccess })
        await refreshVipRequests()
      } catch (err) {
        setVipRequestFeedback({ type: 'error', text: err.message })
      } finally {
        setIsRequestingVip(false)
      }
    },
    [requireLogin, authedJson, product, strings.vipRequestSuccess, strings.vipRequestLogin, refreshVipRequests],
  )

  const handleVideoAction = useCallback(async () => {
    const experience = VIDEO_EXPERIENCE_ID
    if (grantedVipIds.includes(experience)) {
      if (!requireLogin()) return
      const orderId = await ensureConciergeOrder()
      if (!orderId) return
      setVideoState((prev) => (prev === 'live' ? 'idle' : 'live'))
      await authedJson(`/api/chat/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ message: videoState === 'live' ? 'Closed atelier video session.' : 'Requested live atelier video.' }),
      }).catch(() => {})
      return
    }
    await handleVipRequest(experience)
  }, [grantedVipIds, requireLogin, ensureConciergeOrder, authedJson, videoState, handleVipRequest])

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-lg text-neutral-500">
          {strings.loading}
        </div>
      </Layout>
    )
  }

  const price = format(product.priceCents || 0, { fromCurrency: product.currency || 'USD' })
  const vipStatusMap = useMemo(() => {
    const map = {}
    vipRequests.forEach((request) => {
      if (!map[request.experienceId]) {
        map[request.experienceId] = request.status
      }
    })
    return map
  }, [vipRequests])
  const pendingVip = vipRequests.some((request) => request.status === 'pending')
  const derivedVipStatus = grantedVipIds.length ? 'granted' : pendingVip ? 'requested' : 'guest'
  const firstLockedExperience = vipCatalog.find((experience) => !grantedVipIds.includes(experience.id))
  const videoRequestStatus = vipStatusMap[VIDEO_EXPERIENCE_ID]
  const videoAccessGranted = grantedVipIds.includes(VIDEO_EXPERIENCE_ID)
  const chatAccessGranted = grantedVipIds.includes(CHAT_EXPERIENCE_ID)
  const experienceLockMessage =
    derivedVipStatus === 'granted'
      ? 'Unlocked couture perks curated for you.'
      : 'Request access and an admin concierge will unlock the VIP rooms.'
  const videoCtaLabel = videoAccessGranted
    ? videoState === 'live'
      ? 'Leave video room'
      : strings.videoCallCta
    : videoRequestStatus === 'pending'
    ? strings.videoPending
    : strings.videoCallCta
  const videoSubcopy =
    videoState === 'live'
      ? 'Live atelier on — cameras calibrated.'
      : videoAccessGranted
      ? strings.videoGranted
      : videoRequestStatus === 'pending'
      ? strings.videoPending
      : strings.videoLocked
  const chatDisabled = !chatInput.trim() || chatLoading || isEnsuringThread
  const vipFeedbackClass = vipRequestFeedback
    ? vipRequestFeedback.type === 'success'
      ? 'text-emerald-600'
      : 'text-rose-600'
    : ''

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-neutral-100">
              {product?.images?.[0] ? (
                <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="aspect-[4/5] w-full bg-gradient-to-br from-neutral-200 to-neutral-50" />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(product?.images || []).slice(1, 4).map((src, idx) => (
                <img
                  key={src || idx}
                  src={src}
                  alt={`${product.title} alt ${idx + 1}`}
                  className="h-32 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{product.category || 'atelier drop'}</p>
              <h1 className="mt-2 text-4xl font-serif text-neutral-900">{product.title}</h1>
              <p className="mt-6 text-lg text-neutral-600">{product.description}</p>
              <div className="mt-6 text-2xl font-semibold text-neutral-900">{strings.priceLabel}: {price}</div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-500">{strings.sizeLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {DEFAULT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selectedSize === size ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-500">{strings.colorLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        selectedColor === color ? 'border-neutral-900 text-neutral-900' : 'border-neutral-200 text-neutral-600'
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span className="h-4 w-4 rounded-full border" style={{ background: color === 'Porcelain' ? '#f5f3f0' : color === 'Obsidian' ? '#111' : '#014022' }} />
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-500">{strings.quantityLabel}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityStep(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-xl"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(event) => handleQuantityChange(event.target.value)}
                    className="w-16 rounded-full border border-neutral-200 px-3 py-2 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityStep(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex-1 rounded-full bg-neutral-900 px-6 py-3 text-white transition hover:bg-neutral-800">
                {strings.addToBag}
              </button>
              <button
                type="button"
                onClick={handleVideoAction}
                disabled={isRequestingVip && !videoAccessGranted}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  videoAccessGranted
                    ? 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                    : 'border-neutral-300 text-neutral-600'
                } ${isRequestingVip && !videoAccessGranted ? 'opacity-50' : ''}`}
              >
                {videoCtaLabel}
              </button>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">{strings.conciergeTitle}</p>
                  <p className="text-base text-neutral-600">{experienceLockMessage}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    derivedVipStatus === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : derivedVipStatus === 'requested'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {derivedVipStatus === 'granted'
                    ? 'Granted'
                    : derivedVipStatus === 'requested'
                    ? 'Awaiting admin'
                    : 'Guest'}
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {vipCatalog.map((experience) => {
                  const unlocked = grantedVipIds.includes(experience.id)
                  const requestStatus = vipStatusMap[experience.id]
                  const statusLabel = unlocked
                    ? 'Granted'
                    : requestStatus === 'pending'
                    ? 'Pending admin'
                    : requestStatus === 'rejected'
                    ? 'Try a new brief'
                    : 'Locked'
                  const statusTone = unlocked
                    ? 'text-emerald-700'
                    : requestStatus === 'pending'
                    ? 'text-amber-700'
                    : requestStatus === 'rejected'
                    ? 'text-rose-600'
                    : 'text-neutral-500'
                  return (
                    <li
                      key={experience.id}
                      className={`rounded-2xl border px-4 py-3 ${unlocked ? 'border-emerald-200 bg-emerald-50/60' : 'border-neutral-200'}`}
                    >
                      <p className="text-sm font-semibold text-neutral-900">
                        {experience.title}
                        <span className={`ml-2 text-xs font-medium uppercase tracking-wide ${statusTone}`}>{statusLabel}</span>
                      </p>
                      <p className="text-sm text-neutral-600">{experience.tagline}</p>
                      {!unlocked && (
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className={`${statusTone}`}>
                            {requestStatus === 'pending' ? 'Our admin team is reviewing.' : 'Tap request to notify the concierge team.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVipRequest(experience.id)}
                            disabled={isRequestingVip || requestStatus === 'pending'}
                            className={`font-semibold text-neutral-900 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60 ${
                              requestStatus === 'pending' ? 'pointer-events-none' : ''
                            }`}
                          >
                            {requestStatus === 'pending' ? 'In review' : 'Request'}
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {firstLockedExperience && (
                <button
                  type="button"
                  onClick={() => handleVipRequest(firstLockedExperience.id)}
                  disabled={isRequestingVip}
                  className={`mt-4 w-full rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    isRequestingVip ? 'border-neutral-300 text-neutral-400' : 'border-neutral-900 text-neutral-900'
                  }`}
                >
                  {isRequestingVip ? 'Sending request…' : strings.vipRequest}
                </button>
              )}
              {vipRequestFeedback && (
                <p className={`mt-2 text-sm ${vipFeedbackClass}`}>{vipRequestFeedback.text}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Immersive video</p>
                <p className="text-base text-neutral-600">{videoSubcopy}</p>
              </div>
              <span className="text-sm font-semibold text-neutral-500">
                {(videoAccessGranted ? videoState : videoRequestStatus || 'locked').toUpperCase()}
              </span>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
              <div className="aspect-video w-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-white">
                <div className="flex h-full w-full flex-col justify-between p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                    {videoState === 'live' ? 'LIVE' : 'Standby' }
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{product.title}</p>
                    <p className="text-sm text-neutral-300">{selectedColor} · Size {selectedSize}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral-500">
                <p>
                  {videoState === 'live'
                    ? 'Recording fit notes automatically.'
                    : videoAccessGranted
                    ? 'Camera and audio checks complete.'
                    : strings.videoLocked}
                </p>
                <button
                  type="button"
                  onClick={handleVideoAction}
                  disabled={isRequestingVip && !videoAccessGranted}
                  className={`text-neutral-900 underline-offset-4 hover:underline ${
                    isRequestingVip && !videoAccessGranted ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {videoCtaLabel}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Chat thread</p>
                <p className="text-base text-neutral-600">{token ? strings.chatCta : strings.chatLogin}</p>
              </div>
              <span className="text-xs font-medium text-neutral-500">
                {chatLoading ? 'Syncing…' : chatAccessGranted ? 'VIP priority' : 'Response under 5m'}
              </span>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl px-4 py-3 text-sm ${message.sender === 'You' ? 'bg-neutral-900 text-white ml-8' : 'bg-neutral-100 text-neutral-700 mr-8'}`}
                >
                  <p className="font-semibold">{message.sender}</p>
                  <p className="mt-1 leading-relaxed">{message.message}</p>
                </div>
              ))}
              {!chatMessages.length && (
                <div className="rounded-2xl bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
                  Concierge replies will collect here once you say hello.
                </div>
              )}
            </div>
            {isEnsuringThread && (
              <p className="mt-2 text-xs text-neutral-500">Opening your private concierge thread…</p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                placeholder={strings.chatPlaceholder}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (!chatDisabled) handleChatSend()
                  }
                }}
                className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={handleChatSend}
                disabled={chatDisabled}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                  chatDisabled ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {strings.chatSend}
              </button>
            </div>
            {(chatError || !token) && (
              <p className={`mt-2 text-sm ${chatError ? 'text-rose-600' : 'text-neutral-500'}`}>
                {chatError || strings.chatLogin}
              </p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}
