'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useSession } from '../../../components/SessionProvider'
import { useAuthedSWR } from '../../../hooks/useAuthedSWR'
import { useLocale } from '@/components/LocaleProvider'

const ROLE_OPTIONS = ['customer', 'designer', 'admin']

export default function AdminUsersClient() {
  const router = useRouter()
  const { status, user, token } = useSession()
  const { locale } = useLocale()
  const isAdmin = status === 'authenticated' && user?.role === 'admin'
  const { data, isLoading, error, mutate } = useAuthedSWR(isAdmin ? '/api/admin/users' : null, { enabled: isAdmin })
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const users = data?.users || []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(`/${locale}/admin/users`)}`)
    } else if (status === 'authenticated' && !isAdmin) {
      router.replace('/')
    }
  }, [status, isAdmin, router, locale])

  const callAdminAction = async (path, body = {}) => {
    if (!token) return
    setFeedback(null)
    setBusyId(body.id || null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Request failed')
      }
      await mutate()
      setFeedback({ type: 'success', text: 'Updated user' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const handleApproveDesigner = (userId) => callAdminAction(`/api/admin/users/${userId}/approve-designer`, { id: userId })
  const handleApproveKyc = (userId) => callAdminAction(`/api/admin/users/${userId}/approve-kyc`, { id: userId })
  const handleRoleChange = (userId, role) => callAdminAction(`/api/admin/users/${userId}/role`, { id: userId, role })

  if (status === 'idle' || status === 'loading') {
    return (
      <Container className="py-24 text-center text-muted">
        Loading admin queue…
      </Container>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-10 pb-16">
      <Container className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Membership approvals</h1>
        <p className="text-muted">
          Verify designers, manage roles, and approve KYC from a single workspace.
        </p>
      </Container>

      {feedback && (
        <Container>
          <Card className={`text-sm ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>
            {feedback.text}
          </Card>
        </Container>
      )}

      <Container>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Verified</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Loading users…
                  </td>
                </tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    No users in queue.
                  </td>
                </tr>
              )}
              {users.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted">{row.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="form-select"
                      value={row.role}
                      onChange={(event) => handleRoleChange(row.id, event.target.value)}
                      disabled={busyId === row.id}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tag-chip text-xs">{row.verified ? 'Verified' : 'Pending'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {!row.verified && (
                        <Button variant="secondary" size="sm" onClick={() => handleApproveDesigner(row.id)} disabled={busyId === row.id}>
                          Approve designer
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => handleApproveKyc(row.id)} disabled={busyId === row.id}>
                        Mark KYC
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="text-xs text-rose-300 mt-4">Unable to load users.</p>}
      </Container>
    </div>
  )
}
