import { useState } from 'react'
import Layout from '../../components/Layout'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useSession } from '../../components/SessionProvider'

const ROLE_OPTIONS = ['customer', 'designer', 'admin']

export default function AdminUsersPage() {
  const { status, isAuthorized } = useRequireAuth({ roles: ['admin'] })
  const { token } = useSession()
  const { data, isLoading, error, mutate } = useAuthedSWR('/api/admin/users', { enabled: isAuthorized })
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const users = data?.users || []

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

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">Loading admin queue…</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="text-4xl font-serif">Membership approvals</h1>
        <p className="text-muted mt-2">Verify designers, manage roles, and approve KYC from a single workspace.</p>
      </section>

      {feedback && (
        <p className={`text-sm mb-4 ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>{feedback.text}</p>
      )}

      <div className="surface-glass rounded-2xl overflow-hidden">
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
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="form-select"
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    disabled={busyId === user.id}
                  >
                    {ROLE_OPTIONS.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="tag-chip text-xs">{user.verified ? 'Verified' : 'Pending'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 justify-end">
                    {!user.verified && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleApproveDesigner(user.id)}
                        disabled={busyId === user.id}
                      >
                        Approve designer
                      </button>
                    )}
                    <button
                      className="btn-secondary"
                      onClick={() => handleApproveKyc(user.id)}
                      disabled={busyId === user.id}
                    >
                      Mark KYC
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-xs text-rose-300 mt-4">Unable to load users.</p>}
    </Layout>
  )
}
