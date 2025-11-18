'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import AutoGrid from '../ui/AutoGrid'
import Badge from '../ui/Badge'
import { useSession } from '../../../components/SessionProvider'

const BASE_FIELDS = [
  { key: 'name', label: 'Full name', placeholder: 'Ama K.', type: 'text' },
  { key: 'pronouns', label: 'Preferred pronouns', placeholder: 'She / They', type: 'text' },
  { key: 'location', label: 'Location', placeholder: 'Accra, Ghana', type: 'text' },
  { key: 'phoneNumber', label: 'Phone number', placeholder: '+233 ...', type: 'tel' },
]

export default function ProfileClient() {
  const router = useRouter()
  const { status, user, updateProfile } = useSession()
  const [form, setForm] = useState(() => mapUserToForm(user))
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(mapUserToForm(user))
  }, [user])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/account/login?redirect=${encodeURIComponent('/profile')}`)
    }
  }, [status, router])

  const isLoading = status === 'idle' || status === 'loading'
  const isAuthorized = status === 'authenticated'

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isAuthorized) return
    setMessage(null)
    setIsSaving(true)
    try {
      await updateProfile({
        name: form.name,
        pronouns: form.pronouns,
        location: form.location,
        phoneNumber: form.phoneNumber,
        styleNotes: form.styleNotes,
      })
      setMessage({ type: 'success', text: 'Profile saved' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to save profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const conciergePerks = useMemo(
    () => [
      { label: 'Virtual fittings', detail: 'Live video or AR measurements' },
      { label: 'Concierge chat', detail: 'Shared threads with designers' },
      { label: 'Archive sourcing', detail: 'Global scouts locate rare pieces' },
    ],
    [],
  )

  if (isLoading) {
    return (
      <Container className="py-24 text-center text-muted">
        Loading your profile…
      </Container>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="space-y-10 pb-20">
      <Container className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Profile</p>
        <h1 className="text-4xl font-serif">Finish setting up your profile</h1>
        <p className="text-muted max-w-2xl">
          Complete measurements, preferences, and concierge contacts so designers can tailor proposals to you.
        </p>
      </Container>

      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card as="form" className="space-y-6" onSubmit={handleSubmit}>
          {BASE_FIELDS.map((field) => (
            <label key={field.key} className="block text-xs uppercase tracking-[0.2em] text-muted">
              {field.label}
              <input
                className="form-input mt-2"
                placeholder={field.placeholder}
                type={field.type}
                value={form[field.key] || ''}
                onChange={handleChange(field.key)}
                disabled={!isAuthorized}
              />
            </label>
          ))}

          <label className="block text-xs uppercase tracking-[0.2em] text-muted">
            Style notes
            <textarea
              className="form-input mt-2"
              rows={4}
              placeholder="Silhouettes, designers, fit notes"
              value={form.styleNotes || ''}
              onChange={handleChange('styleNotes')}
              disabled={!isAuthorized}
            />
          </label>

          {message && (
            <p
              className={`text-sm ${message.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" className="w-full justify-center" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="text-xl font-serif">Measurements</h2>
            <p className="text-sm text-muted">
              Upload your measurement sheet or request a virtual fitting with our concierge.
            </p>
            <Button variant="secondary" className="w-full justify-center" disabled={isSaving}>
              Upload measurements
            </Button>
            <Button variant="secondary" className="w-full justify-center" disabled={isSaving}>
              Book virtual fitting
            </Button>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Concierge perks</p>
              <h3 className="text-lg font-serif">Complimentary services</h3>
            </div>
            <AutoGrid cols="grid-cols-1" className="gap-4">
              {conciergePerks.map((perk) => (
                <div key={perk.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{perk.label}</p>
                    <p className="text-xs text-muted/80">{perk.detail}</p>
                  </div>
                  <Badge variant="accent">VIP</Badge>
                </div>
              ))}
            </AutoGrid>
          </Card>
        </div>
      </Container>
    </div>
  )
}

function mapUserToForm(user) {
  return {
    name: user?.name || '',
    pronouns: user?.pronouns || '',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || '',
    styleNotes: user?.styleNotes || '',
  }
}
