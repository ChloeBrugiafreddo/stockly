'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Sector {
  _id: string
  name: string
  description: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '',
    password: '', confirmPassword: '',
    companyName: '', sectorId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/sectors').then(r => r.json()).then(d => setSectors(d.sectors || []))
  }, [])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return }
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstname: form.firstname, lastname: form.lastname,
        email: form.email, password: form.password,
        companyName: form.companyName, sectorId: form.sectorId,
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Erreur'); return }
    router.push('/login?registered=true')
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
    transition: 'border-color 0.15s',
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
        maxWidth: '480px',
        padding: '40px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/Logo-fondclair.png" alt="Stockly" width={120} height={40} style={{ objectFit: 'contain' }} />
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            Créez votre espace de gestion
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Prénom + Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={label}>Prénom *</label>
              <input style={input} required value={form.firstname} onChange={e => set('firstname', e.target.value)} placeholder="Chloé" />
            </div>
            <div>
              <label style={label}>Nom *</label>
              <input style={input} required value={form.lastname} onChange={e => set('lastname', e.target.value)} placeholder="Dupont" />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Email *</label>
            <input style={input} type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@exemple.com" />
          </div>

          {/* Entreprise */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Nom de votre entreprise *</label>
            <input style={input} required value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ex: Aurora Racing" />
          </div>

          {/* Secteur */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Votre domaine métier *</label>
            <select
              style={{ ...input, cursor: 'pointer' }}
              required
              value={form.sectorId}
              onChange={e => set('sectorId', e.target.value)}
            >
              <option value="">Sélectionnez votre domaine</option>
              {sectors.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Personnalise votre interface et vos champs de stock
            </p>
          </div>

          {/* Mot de passe */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={label}>Mot de passe *</label>
              <input style={input} type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="8 caractères min." />
            </div>
            <div>
              <label style={label}>Confirmer *</label>
              <input style={input} type="password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '10px', padding: '12px 14px',
              fontSize: '13px', color: '#dc2626', marginBottom: '16px',
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
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: '#3b82f6', fontWeight: 500, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  )
}