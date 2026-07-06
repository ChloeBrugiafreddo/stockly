'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export function ProductionFormModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ref: '', name: '', description: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const r = await fetch('/api/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    onSaved()
  }

  const input = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const label = {
    display: 'block', fontSize: '13px', fontWeight: 500 as const,
    color: 'var(--muted)', marginBottom: '6px',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '480px', padding: '28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
            Nouvelle production
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={label}>Référence *</label>
              <input style={input} required value={form.ref}
                onChange={e => set('ref', e.target.value)}
                placeholder="ex: PROD-2025-001, BMW-AB123CD, LOT-42" />
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Identifiant unique de cette production
              </p>
            </div>
            <div>
              <label style={label}>Nom *</label>
              <input style={input} required value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="ex: BMW Série 3 AB-123-CD, Manteau hiver collection 2025" />
            </div>
            <div>
              <label style={label}>Description</label>
              <input style={input} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Description optionnelle" />
            </div>
            <div>
              <label style={label}>Notes</label>
              <input style={input} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Notes internes optionnelles" />
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'transparent', color: 'var(--foreground)',
              fontSize: '14px', cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={{
              padding: '10px 20px', borderRadius: '10px',
              background: '#3b82f6', color: 'white', border: 'none',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}