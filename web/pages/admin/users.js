import { useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { useAuthedSWR } from '../../hooks/useAuthedSWR'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useSession } from '../../components/SessionProvider'
import { useLocale } from '../../components/LocaleProvider'

const ROLE_OPTIONS = ['customer', 'designer', 'admin']

export default function AdminUsersPage() {
  const { t } = useLocale()
  const { status, isAuthorized } = useRequireAuth({ roles: ['admin'] })
  const { token } = useSession()
  const { data, isLoading, error, mutate } = useAuthedSWR('/api/admin/users', { enabled: isAuthorized })
  const { data: vipCatalogData } = useAuthedSWR('/api/admin/vip/experiences', { enabled: isAuthorized })
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const users = data?.users || []
  const vipCatalog = vipCatalogData?.experiences || []

  const strings = useMemo(
    () => ({
      loading: t('pages.adminUsers.loading', 'Loading admin queue…'),
      pageEyebrow: t('pages.adminUsers.eyebrow', 'Admin'),
      pageTitle: t('pages.adminUsers.title', 'Membership approvals'),
      pageDescription: t(
        'pages.adminUsers.description',
        'Verify designers, manage roles, and approve KYC from a single workspace.',
      ),
      feedback: {
        success: t('pages.adminUsers.feedback.success', 'Updated user'),
      },
      table: {
        name: t('pages.adminUsers.table.name', 'Name'),
        email: t('pages.adminUsers.table.email', 'Email'),
        role: t('pages.adminUsers.table.role', 'Role'),
        verified: t('pages.adminUsers.table.verified', 'Verified'),
        vip: t('pages.adminUsers.table.vip', 'VIP access'),
        actions: t('pages.adminUsers.table.actions', 'Actions'),
        loading: t('pages.adminUsers.table.loading', 'Loading users…'),
        empty: t('pages.adminUsers.table.empty', 'No users in queue.'),
        statusVerified: t('pages.adminUsers.table.statusVerified', 'Verified'),
        statusPending: t('pages.adminUsers.table.statusPending', 'Pending'),
      },
      actions: {
        approveDesigner: t('pages.adminUsers.actions.approveDesigner', 'Approve designer'),
        markKyc: t('pages.adminUsers.actions.markKyc', 'Mark KYC'),
        grantVip: t('pages.adminUsers.actions.grantVip', 'Grant VIP'),
        revokeVip: t('pages.adminUsers.actions.revokeVip', 'Revoke VIP'),
      },
      errors: {
        generic: t('pages.adminUsers.errors.generic', 'Unable to load users.'),
      },
      roles: ROLE_OPTIONS.reduce((acc, role) => {
        acc[role] = t(`pages.adminUsers.roles.${role}`, role)
        return acc
      }, {}),
    }),
    [t],
  )

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
      setFeedback({ type: 'success', text: strings.feedback.success })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const handleApproveDesigner = (userId) => callAdminAction(`/api/admin/users/${userId}/approve-designer`, { id: userId })
  const handleApproveKyc = (userId) => callAdminAction(`/api/admin/users/${userId}/approve-kyc`, { id: userId })
  const handleRoleChange = (userId, role) => callAdminAction(`/api/admin/users/${userId}/role`, { id: userId, role })
  const handleVipToggle = (userId, experienceId, hasAccess) =>
    callAdminAction('/api/admin/vip/experiences', {
      id: userId,
      userId,
      experienceId,
      action: hasAccess ? 'revoke' : 'grant',
    })

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <section className="py-24 text-center text-muted">{strings.loading}</section>
      </Layout>
    )
  }

  if (!isAuthorized) return null

  return (
    <Layout>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">{strings.pageEyebrow}</p>
        <h1 className="text-4xl font-serif">{strings.pageTitle}</h1>
        <p className="text-muted mt-2">{strings.pageDescription}</p>
      </section>

      {feedback && (
        <p className={`text-sm mb-4 ${feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>{feedback.text}</p>
      )}

      <div className="surface-glass rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-muted">
            <tr>
              <th className="text-left px-4 py-3">{strings.table.name}</th>
              <th className="text-left px-4 py-3">{strings.table.email}</th>
              <th className="text-left px-4 py-3">{strings.table.role}</th>
              <th className="text-left px-4 py-3">{strings.table.verified}</th>
              <th className="text-left px-4 py-3">{strings.table.vip}</th>
              <th className="px-4 py-3">{strings.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  {strings.table.loading}
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  {strings.table.empty}
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
                        {strings.roles[roleOption]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="tag-chip text-xs">{user.verified ? strings.table.statusVerified : strings.table.statusPending}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(user.notificationPrefs?.vipExperiences || []).length === 0 && (
                        <span className="text-xs text-muted">{strings.actions.grantVip}</span>
                      )}
                      {(user.notificationPrefs?.vipExperiences || []).map((experienceId) => (
                        <span key={experienceId} className="rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-900">
                          {experienceId}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vipCatalog.map((experience) => {
                        const hasAccess = (user.notificationPrefs?.vipExperiences || []).includes(experience.id)
                        return (
                          <button
                            key={experience.id}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              hasAccess ? 'border-emerald-500 text-emerald-500' : 'border-white/20 text-muted'
                            }`}
                            onClick={() => handleVipToggle(user.id, experience.id, hasAccess)}
                            disabled={busyId === user.id}
                          >
                            {hasAccess ? strings.actions.revokeVip : strings.actions.grantVip}
                            <span className="ml-1 font-semibold">{experience.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 justify-end">
                    {!user.verified && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleApproveDesigner(user.id)}
                        disabled={busyId === user.id}
                      >
                        {strings.actions.approveDesigner}
                      </button>
                    )}
                    <button
                      className="btn-secondary"
                      onClick={() => handleApproveKyc(user.id)}
                      disabled={busyId === user.id}
                    >
                      {strings.actions.markKyc}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-xs text-rose-300 mt-4">{strings.errors.generic}</p>}
    </Layout>
  )
}
