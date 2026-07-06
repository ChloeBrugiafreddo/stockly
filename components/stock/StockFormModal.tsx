'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { StockItem } from './StockPageClient'
import { useSession } from 'next-auth/react'

interface Props {
  item: StockItem | null
  onClose: () => void
  onSaved: () => void
}

const domainConfig: Record<string, {
  namePlaceholder: string
  skuPlaceholder: string
  descPlaceholder: string
}> = {
  'Automobile': {
    namePlaceholder: 'ex: Filtre à huile, Plaquettes de frein...',
    skuPlaceholder: 'ex: FH-001, PF-AVANT-002...',
    descPlaceholder: 'ex: Compatible BMW Série 3, 2015-2020',
  },
  'Textile': {
    namePlaceholder: 'ex: Tissu coton blanc, Fil à coudre noir...',
    skuPlaceholder: 'ex: TC-BL-001, FAC-N-002...',
    descPlaceholder: 'ex: 100% coton, largeur 150cm, collection été',
  },
  'Alimentaire': {
    namePlaceholder: 'ex: Couteau de chef, Four à convection...',
    skuPlaceholder: 'ex: CC-001, FAC-001...',
    descPlaceholder: 'ex: Acier inoxydable 20cm, usage professionnel',
  },
  'default': {
    namePlaceholder: 'ex: Nom du produit',
    skuPlaceholder: 'ex: REF-001',
    descPlaceholder: 'Description optionnelle',
  },
}

export function StockFormModal({ item, onClose, onSaved }: Props) {
  const { data: session } = useSession()
  const domain = (session?.user as any)?.domain || 'default'
  const config = domainConfig[domain] || domainConfig['default']

  const isEdit = !!item
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    sku: item?.sku || '',
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '0',
    categoryId: item?.categoryId?._id || '',
    quantity: item?.totalQuantity?.toString() || '0',
    minimumStock: item?.minimumStock?.toString() || '0',
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }, [])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = isEdit ? `/api/stocks/${item._id}` : '/api/stocks'
    const method = isEdit ? 'PUT' : 'POST'

    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId || null,
        quantity: Number(form.quantity),
        minimumStock: Number(form.minimumStock),
      }),
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

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: 500 as const, color: 'var(--muted)', marginBottom: '6px',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '520px',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
            {isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nom du produit *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                placeholder={config.namePlaceholder}
              />
            </div>

            <div>
              <label style={labelStyle}>SKU (référence) *</label>
              <input
                style={inputStyle}
                value={form.sku}
                onChange={e => set('sku', e.target.value)}
                required
                placeholder={config.skuPlaceholder}
                disabled={isEdit}
              />
            </div>

            <div>
              <label style={labelStyle}>Prix unitaire (€)</label>
              <input
                style={inputStyle}
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <input
                style={inputStyle}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder={config.descPlaceholder}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Catégorie</label>
              <select style={inputStyle} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">Sans catégorie</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {!isEdit && (
              <div>
                <label style={labelStyle}>Quantité initiale</label>
                <input
                  style={inputStyle}
                  type="number" min="0"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Seuil d'alerte</label>
              <input
                style={inputStyle}
                type="number" min="0"
                value={form.minimumStock}
                onChange={e => set('minimumStock', e.target.value)}
              />
            </div>

          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px' }}>{error}</p>
          )}

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
              {loading ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}