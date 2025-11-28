'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useSession } from '../../../components/SessionProvider'
import { normalizeRedirectTarget } from './redirectUtils'

const FALLBACK_REDIRECT = '/profile'

export default function LoginClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectParam = searchParams.get('redirect')
    const redirectTarget = useMemo(() => {
        return normalizeRedirectTarget(redirectParam, FALLBACK_REDIRECT)
    }, [redirectParam])
    const { login, status } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    async function submit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login({ email, password })
            setLoggedIn(true)
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (loggedIn && status === 'authenticated') {
            router.push(redirectTarget)
        }
    }, [loggedIn, status, router, redirectTarget])

    return (
        <Container className="w-1/2 mx-auto py-20">
            <Card className="p-4 space-y-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-serif">Sign in</h1>
                    <p className="text-xs text-muted">Access your account</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="form-input text-sm" type="email" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input text-sm" required />
                    </div>
                    {error && <p className="text-xs text-rose-400">{error}</p>}
                    <Button type="submit" className="w-full justify-center text-sm" disabled={submitting || status === 'loading'}>
                        {submitting || status === 'loading' ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <p className="text-xs text-muted text-center pt-2 border-t border-card-border">
                    New to Luxe? <Link href="/register" className="theme-link">Create account</Link>
                </p>
            </Card>
        </Container>
    )
}
