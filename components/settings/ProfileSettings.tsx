'use client'

import { useEffect, useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

export function ProfileSettings() {
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    fetch('/api/settings/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setForm(f => ({
            ...f,
            firstname: d.user.firstname || '',
            lastname: d.user.lastname || '',
            email: d.user.email || '',
          }))
        }
      })
  }, [])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const r = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      }),
    })

    const j = await r.json()
    setLoading(false)

    if (!r.ok) { setError(j.error || 'Erreur'); return }
    setSuccess('Profil mis à jour avec succès')
    setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
  }

  const input = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const label = {
    display: 'block', fontSize: '13px',
    fontWeight: 500 as const, color: 'var(--muted)', marginBottom: '6px',
  }

  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: '14px', padding: '28px',
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>
        Informations personnelles
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={label}>Prénom</label>
            <input style={input} value={form.firstname} onChange={e => set('firstname', e.target.value)} />
          </div>
          <div>
            <label style={label}>Nom</label>
            <input style={input} value={form.lastname} onChange={e => set('lastname', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Email</label>
            <input style={input} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div style={{
          borderTop: '1px solid var(--card-border)',
          paddingTop: '24px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
              Changer le mot de passe
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '12px',
              }}
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={label}>Mot de passe actuel</label>
              <input
                style={input}
                type={showPasswords ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={e => set('currentPassword', e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={label}>Nouveau mot de passe</label>
                <input
                  style={input}
                  type={showPasswords ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={e => set('newPassword', e.target.value)}
                  placeholder="8 caractères minimum"
                />
              </div>
              <div>
                <label style={label}>Confirmer</label>
                <input
                  style={input}
                  type={showPasswords ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '13px', color: '#dc2626', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '13px', color: '#16a34a', marginBottom: '16px',
          }}>
            {success}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px',
          background: '#3b82f6', color: 'white', border: 'none',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          <Save size={16} />
          {loading ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  )
}