'use client'

import { useEffect, useState } from 'react'
import { Save, Building2 } from 'lucide-react'

export function CompanySettings() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
  })
  const [sector, setSector] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings/company')
      .then(r => r.json())
      .then(d => {
        if (d.company) {
          setForm({
            name: d.company.name || '',
            email: d.company.email || '',
            phone: d.company.phone || '',
            address: d.company.address || '',
          })
          setSector(d.company.sectorId)
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
    setLoading(true)

    const r = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    setSuccess('Informations entreprise mises à jour')
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
        Informations entreprise
      </h2>

      {/* Secteur — lecture seule */}
      {sector && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px',
          background: 'var(--accent-light)', marginBottom: '24px',
        }}>
          <Building2 size={16} color="var(--accent-text)" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Secteur d'activité</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-text)' }}>
              {sector.name}
            </p>
            {sector.description && (
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                {sector.description}
              </p>
            )}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>
            Non modifiable
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={label}>Nom de l'entreprise *</label>
            <input style={input} required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={label}>Email</label>
              <input style={input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@entreprise.com" />
            </div>
            <div>
              <label style={label}>Téléphone</label>
              <input style={input} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01 00 00 00 00" />
            </div>
          </div>
          <div>
            <label style={label}>Adresse</label>
            <input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="1 rue de la Paix, 75001 Paris" />
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