import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession } from '../components/SessionProvider'

export function useRequireAuth({ roles = [], redirectTo = '/account/login' } = {}) {
  const router = useRouter()
  const { status, user } = useSession()
  const roleList = Array.isArray(roles) ? roles : [roles]

  useEffect(() => {
    if (status === 'unauthenticated') {
      const target = `${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`
      router.replace(target)
    } else if (status === 'authenticated' && roleList.length && user && !roleList.includes(user.role)) {
      router.replace('/')
    }
  }, [status, user, roleList.join(','), router, redirectTo])

  return {
    status,
    user,
    isAuthorized:
      status === 'authenticated' && (roleList.length === 0 || (user && roleList.includes(user.role))),
  }
}
