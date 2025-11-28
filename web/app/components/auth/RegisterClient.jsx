'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useSession } from '../../../components/SessionProvider'
import { normalizeRedirectTarget } from './redirectUtils'

const FALLBACK_REDIRECT = '/profile'

export default function RegisterClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectParam = searchParams.get('redirect')
    const redirectTarget = useMemo(() => {
        return normalizeRedirectTarget(redirectParam, FALLBACK_REDIRECT)
    }, [redirectParam])
    const { register: registerUser, status } = useSession()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('customer')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function submit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await registerUser({ name, email, password, role })
            router.push(redirectTarget)
        } catch (err) {
            setError(err.message || 'Registration failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container className="w-1/2 mx-auto py-20">
            <Card className="p-4 space-y-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-serif">Create account</h1>
                    <p className="text-xs text-muted">Join Luxe Atelier</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">I am a</label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="form-input text-sm"
                            required
                        >
                            <option value="customer">Customer</option>
                            <option value="designer">Designer</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="form-input text-sm" required />
                    </div>
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
                        {submitting || status === 'loading' ? 'Creating account...' : 'Register'}
                    </Button>
                </form>

                <p className="text-xs text-muted text-center pt-2 border-t border-card-border">
                    Already joined? <Link href="/login" className="theme-link">Sign in</Link>
                </p>
            </Card>
        </Container>
    )
}
