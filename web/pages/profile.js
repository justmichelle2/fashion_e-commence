import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useSession } from '../components/SessionProvider'
import { useRequireAuth } from '../hooks/useRequireAuth'

const BASE_FIELDS = [
  { key: 'name', label: 'Full name', placeholder: 'Ama K.', type: 'text' },
  { key: 'pronouns', label: 'Preferred pronouns', placeholder: 'She / They', type: 'text' },
  { key: 'location', label: 'Location', placeholder: 'Accra, Ghana', type: 'text' },
  { key: 'phoneNumber', label: 'Phone number', placeholder: '+233 ...', type: 'tel' },
]

export default function ProfilePage() {
  const { isAuthorized, status } = useRequireAuth()
  const { user, updateProfile } = useSession()
  const [form, setForm] = useState({
    name: user?.name || '',
    pronouns: user?.pronouns || '',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || '',
    styleNotes: user?.styleNotes || '',
  })
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: user?.name || '',
      pronouns: user?.pronouns || '',
      location: user?.location || '',
      phoneNumber: user?.phoneNumber || '',
      styleNotes: user?.styleNotes || '',
    })
  }, [user])

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const isLoading = status === 'loading' || status === 'idle'

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

  if (isLoading) {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading your profile…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Profile</p>
        <h1 className="text-4xl font-serif">Finish setting up your profile</h1>
        <p className="text-muted mt-2 max-w-2xl">Complete measurements, preferences, and concierge contacts so designers can tailor proposals to you.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form className="lg:col-span-2 surface-glass p-8 rounded-2xl space-y-6" onSubmit={handleSubmit}>
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
            <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={!isAuthorized || isLoading || isSaving}>
            {isSaving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
        <aside className="surface-glass p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-serif">Measurements</h2>
          <p className="text-sm text-muted">Upload your measurement sheet or request a virtual fitting with our concierge.</p>
          <button className="btn-secondary w-full" disabled={!isAuthorized || isLoading || isSaving}>Upload measurements</button>
          <button className="btn-secondary w-full" disabled={!isAuthorized || isLoading || isSaving}>Book virtual fitting</button>
        </aside>
      </div>
    </Layout>
  )
}
