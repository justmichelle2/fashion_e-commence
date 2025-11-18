import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import SectionHeader from '../../components/SectionHeader'
import CustomOrderTimeline from '../../components/CustomOrderTimeline'
import { useSession } from '../../components/SessionProvider'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'

const formatMoney = (value, currency = 'USD') => {
  if (typeof value !== 'number') return 'Pending'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value / 100)
}

const STATUS_OPTIONS = [
  'requested',
  'quoted',
  'in_progress',
  'in_production',
  'delivered',
  'completed',
]

export default function CustomOrderDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, token, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    mutate: mutateOrders,
  } = useAuthedSWR('/api/custom-orders', { enabled: isAuthenticated })

  const order = useMemo(() => ordersData?.orders?.find((entry) => entry.id === id), [ordersData, id])

  const {
    data: chatData,
    isLoading: chatLoading,
    mutate: mutateChat,
  } = useAuthedSWR(id ? `/api/chat/${id}` : null, { enabled: Boolean(id) && isAuthenticated })

  const messages = chatData?.messages || []
  const [chatMessage, setChatMessage] = useState('')
  const [assetUrl, setAssetUrl] = useState('')
  const [designerQuote, setDesignerQuote] = useState({ amount: '', days: '' })
  const [statusUpdate, setStatusUpdate] = useState(order?.status || 'requested')
  const [busyAction, setBusyAction] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const role = user?.role
  const isDesigner = role === 'designer'
  const isCustomer = role === 'customer'

  const showDesignerResponse = isDesigner && order?.status === 'requested'
  const showCustomerApproval = isCustomer && order?.status === 'quoted'

  useEffect(() => {
    if (order?.status) setStatusUpdate(order.status)
  }, [order?.status])

  const handleChatSend = async (event) => {
    event.preventDefault()
    if (!chatMessage.trim()) return
    setBusyAction('chat')
    setFeedback(null)
    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: chatMessage }),
      })
      if (!res.ok) throw new Error('Unable to send message')
      setChatMessage('')
      mutateChat()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  const handleAssetUpload = async (event) => {
    event.preventDefault()
    if (!assetUrl.trim()) return
    setBusyAction('asset')
    setFeedback(null)
    try {
      const res = await fetch(`/api/custom-orders/${id}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inspirationImages: [assetUrl.trim()] }),
      })
      if (!res.ok) throw new Error('Unable to attach asset')
      setAssetUrl('')
      mutateOrders()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  const handleDesignerRespond = async (event) => {
    event.preventDefault()
    if (!designerQuote.amount || !designerQuote.days) return
    setBusyAction('respond')
    setFeedback(null)
    try {
      const res = await fetch(`/api/custom-orders/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'accept',
          quoteCents: Math.round(parseFloat(designerQuote.amount) * 100),
          estimatedDeliveryDays: parseInt(designerQuote.days, 10),
        }),
      })
      if (!res.ok) throw new Error('Unable to send quote')
      setDesignerQuote({ amount: '', days: '' })
      mutateOrders()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  const handleRejectBrief = async () => {
    setBusyAction('reject')
    setFeedback(null)
    try {
      const res = await fetch(`/api/custom-orders/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      })
      if (!res.ok) throw new Error('Unable to reject brief')
      mutateOrders()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  const handleStatusUpdate = async (event) => {
    event.preventDefault()
    setBusyAction('status')
    setFeedback(null)
    try {
      const res = await fetch(`/api/custom-orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusUpdate }),
      })
      if (!res.ok) throw new Error('Unable to update status')
      mutateOrders()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  const handleCustomerApprove = async () => {
    setBusyAction('approve')
    setFeedback(null)
    try {
      const res = await fetch(`/api/custom-orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'in_progress', paymentStatus: 'deposit_paid' }),
      })
      if (!res.ok) throw new Error('Unable to approve quote')
      mutateOrders()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyAction(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Sign in to view custom order workspaces.</section>
      </Layout>
    )
  }

  if (ordersLoading || !order) {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">
          {ordersLoading ? 'Loading workspace…' : 'Custom order not found.'}
        </section>
      </Layout>
    )
  }

  const shippingCity =
    typeof order.shippingAddress === 'string'
      ? order.shippingAddress
      : order.shippingAddress?.city || order.shippingAddress?.line1 || 'Pending'

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Custom order</p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif">{order.title}</h1>
            <p className="text-muted mt-3 max-w-2xl">{order.description || 'Concierge will add notes shortly.'}</p>
          </div>
          <span className="tag-chip text-sm uppercase tracking-[0.3em]">{order.status}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 surface-glass p-6 rounded-2xl space-y-6">
          <SectionHeader title="Timeline" subtitle="Every milestone tracked for you and concierge" />
          <CustomOrderTimeline status={order.status} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Quote</p>
              <p className="text-2xl font-serif">{formatMoney(order.quoteCents, order.currency)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Delivery ETA</p>
              <p className="text-lg">{order.estimatedDeliveryDays ? `${order.estimatedDeliveryDays} days` : 'Pending'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Shipping city</p>
              <p className="text-lg">{shippingCity}</p>
            </div>
          </div>
          {showCustomerApproval && (
            <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
              <p className="text-sm text-emerald-100 mb-3">
                Ready to move forward? Secure the atelier with a 30% deposit.
              </p>
              <button className="btn-primary" onClick={handleCustomerApprove} disabled={busyAction === 'approve'}>
                {busyAction === 'approve' ? 'Processing…' : 'Approve & Pay deposit'}
              </button>
            </div>
          )}
          {showDesignerResponse && (
            <form className="space-y-4" onSubmit={handleDesignerRespond}>
              <SectionHeader title="Respond to brief" subtitle="Share your quote and timeline" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-xs uppercase tracking-[0.25em] text-muted">
                  Quote (USD)
                  <input
                    className="form-input mt-2"
                    type="number"
                    min="0"
                    step="100"
                    value={designerQuote.amount}
                    onChange={(e) => setDesignerQuote((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.25em] text-muted">
                  Delivery timeline (days)
                  <input
                    className="form-input mt-2"
                    type="number"
                    min="1"
                    value={designerQuote.days}
                    onChange={(e) => setDesignerQuote((prev) => ({ ...prev, days: e.target.value }))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="submit" disabled={busyAction === 'respond'}>
                  {busyAction === 'respond' ? 'Sending…' : 'Send quote'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRejectBrief}
                  disabled={busyAction === 'reject'}
                >
                  Decline
                </button>
              </div>
            </form>
          )}
          {(isDesigner || role === 'admin') && (
            <form className="space-y-4" onSubmit={handleStatusUpdate}>
              <SectionHeader title="Status" subtitle="Update milestone for concierge and client" />
              <select
                className="form-select"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <button className="btn-secondary w-fit" type="submit" disabled={busyAction === 'status'}>
                {busyAction === 'status' ? 'Saving…' : 'Update status'}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <section id="chat" className="surface-glass p-5 rounded-2xl space-y-4">
            <SectionHeader title="Chat" subtitle="Concierge + atelier thread" />
            <div className="h-64 overflow-y-auto space-y-3 pr-2">
              {chatLoading && <p className="text-muted">Loading messages…</p>}
              {!chatLoading && messages.length === 0 && (
                <p className="text-muted">No messages yet. Kick things off below.</p>
              )}
              {messages.map((message) => (
                <div key={message.id} className="surface-glass/50 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {message.senderId === user?.id ? 'You' : message.sender?.name || 'Partner'} ·{' '}
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm mt-1">{message.message}</p>
                </div>
              ))}
            </div>
            <form className="space-y-3" onSubmit={handleChatSend}>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Share sketches, notes, or approvals"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button className="btn-primary w-full" disabled={busyAction === 'chat'}>
                {busyAction === 'chat' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </section>

          <section className="surface-glass p-5 rounded-2xl space-y-4">
            <SectionHeader title="Assets" subtitle="Upload inspiration or fitting notes" />
            <div className="flex flex-wrap gap-2">
              {(order.inspirationImages || []).map((url) => {
                let label = url
                try {
                  const hostname = new URL(url).hostname
                  label = hostname.startsWith('www.') ? hostname.slice(4) : hostname
                } catch (err) {
                  label = url.replace(/^https?:\/\//, '')
                }
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted hover:text-white"
                  >
                    {label}
                  </a>
                )
              })}
              {(!order.inspirationImages || order.inspirationImages.length === 0) && (
                <p className="text-sm text-muted">No assets yet.</p>
              )}
            </div>
            <form className="space-y-3" onSubmit={handleAssetUpload}>
              <input
                className="form-input"
                placeholder="https://drive.google.com/..."
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
              />
              <button className="btn-secondary w-full" disabled={busyAction === 'asset'}>
                {busyAction === 'asset' ? 'Uploading…' : 'Attach link'}
              </button>
            </form>
          </section>
        </div>
      </div>

      {feedback && (
        <p className={`mt-6 text-sm ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>
          {feedback.text}
        </p>
      )}

      {ordersError && <p className="text-xs text-rose-300 mt-4">{ordersError.message}</p>}
    </Layout>
  )
}
