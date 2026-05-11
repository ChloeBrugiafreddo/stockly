'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const input = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
  }

  const label = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500' as const,
    color: '#475569',
    marginBottom: '6px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/Logo-fondclair.png" alt="Stockly" width={120} height={40} style={{ objectFit: 'contain' }} />
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            Connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={label}>Mot de passe</label>
            <input
              style={input}
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#dc2626',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: loading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" style={{ color: '#3b82f6', fontWeight: 500, textDecoration: 'none' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}