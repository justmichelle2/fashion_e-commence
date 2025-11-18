import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useSession } from '../../components/SessionProvider'

export default function Login(){
  const router = useRouter()
  const redirect = typeof router.query?.redirect === 'string' ? router.query.redirect : '/profile'
  const { login, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e){
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try{
      await login({ email, password })
      router.push(redirect)
    }catch(err){
      setError(err.message || 'Login failed')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <section className="max-w-lg mx-auto surface-glass p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Account</p>
          <h1 className="text-3xl font-serif mt-2">Sign in</h1>
          <p className="text-sm text-muted mt-2">Access bespoke orders, saved designers, and concierge chat.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="form-input" type="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting || status === 'loading'}>
            {submitting || status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <p className="text-sm text-muted text-center">
          New to Luxe? <Link href="/account/register" className="theme-link">Create an account</Link>
        </p>
      </section>
    </Layout>
  )
}
