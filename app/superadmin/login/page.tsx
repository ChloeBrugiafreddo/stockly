'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const r = await fetch('/api/superadmin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Identifiants incorrects'); return }
    router.push('/superadmin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f6fb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        border: '1px solid #dde3f0',
        width: '100%', maxWidth: '420px',
        padding: '48px 40px',
        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: '26px',
          }}>
            ⚡
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Super Admin
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Panneau d'administration Stockly
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@stockly.app"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                border: '1.5px solid #dde3f0', background: '#f9fafb',
                color: '#0d1117', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1d4ed8'}
              onBlur={e => e.target.style.borderColor = '#dde3f0'}
            />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Mot de passe
            </label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                border: '1.5px solid #dde3f0', background: '#f9fafb',
                color: '#0d1117', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1d4ed8'}
              onBlur={e => e.target.style.borderColor = '#dde3f0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: '10px', padding: '10px 14px',
              fontSize: '13px', color: '#dc2626', marginBottom: '16px',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            borderRadius: '10px',
            background: '#1d4ed8',
            color: 'white', border: 'none',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            letterSpacing: '-0.2px',
          }}>
            {loading ? 'Connexion…' : 'Accéder au panneau →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
          Accès réservé à l'équipe Stockly
        </p>
      </div>
    </div>
  )
}