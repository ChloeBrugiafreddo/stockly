'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { StockItem } from './StockPageClient'

interface Props {
  item: StockItem
  type: 'IN' | 'OUT'
  onClose: () => void
  onSaved: () => void
}

export function MovementModal({ item, type, onClose, onSaved }: Props) {
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isIn = type === 'IN'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const r = await fetch(`/api/stocks/${item._id}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, quantity: Number(quantity), reason }),
    })

    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    onSaved()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '400px',
          padding: '28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
            {isIn ? '➕ Ajouter du stock' : '➖ Retirer du stock'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Info produit */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{item.name}</p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            SKU : {item.sku} — Stock actuel : <strong>{item.totalQuantity}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>
              Quantité *
            </label>
            <input
              type="number"
              min="1"
              max={isIn ? undefined : item.totalQuantity}
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>
              Motif
            </label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={isIn ? 'ex: Réception fournisseur' : 'ex: Vente, casse…'}
              style={inputStyle}
            />
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--card-border)',
                background: 'transparent', color: 'var(--foreground)',
                fontSize: '14px', cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: isIn ? '#16a34a' : '#dc2626',
                color: 'white', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'En cours…' : isIn ? 'Ajouter' : 'Retirer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}