import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useSession } from '../../components/SessionProvider'

export default function Register(){
  const router = useRouter()
  const redirect = typeof router.query?.redirect === 'string' ? router.query.redirect : '/profile'
  const { register: registerUser, status } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e){
    e.preventDefault();
    try{
  await registerUser({ name, email, password, role: 'customer' })
      router.push(redirect)
    }catch(err){
      setError(err.message || 'Register failed')
    }
  }

  return (
    <Layout>
      <section className="max-w-lg mx-auto surface-glass p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Account</p>
          <h1 className="text-3xl font-serif mt-2">Create an account</h1>
          <p className="text-sm text-muted mt-2">Save measurements, manage fittings, and receive concierge updates.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="form-input" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="form-input" type="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting || status === 'loading'}>
            {submitting || status === 'loading' ? 'Creating account...' : 'Register'}
          </button>
        </form>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <p className="text-sm text-muted text-center">
          Already joined? <Link href="/account/login" className="theme-link">Sign in</Link>
        </p>
      </section>
    </Layout>
  )
}
