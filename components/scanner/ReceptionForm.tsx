'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, ArrowLeft, Plus } from 'lucide-react'

interface Props {
  code: string
  product: any
  onSuccess: (data: any) => void
  onRescan: () => void
}

export function ReceptionForm({ code, product, onSuccess, onRescan }: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    // Si produit connu
    quantity: 1,
    supplierId: '',
    notes: '',
    // Si produit inconnu
    name: '',
    sku: code,
    categoryId: '',
    price: 0,
    minimumStock: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(d => setSuppliers(d.items || []))
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))

    // Pré-rempli fournisseur si produit connu
    if (product?.supplierId?._id) {
      setForm(f => ({ ...f, supplierId: product.supplierId._id }))
    }
  }, [product])

  function set(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      let productId = product?._id

      // Si produit inconnu → créer d'abord
      if (!product) {
        const r = await fetch('/api/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: form.sku,
            name: form.name,
            categoryId: form.categoryId || null,
            supplierId: form.supplierId || null,
            price: Number(form.price),
            minimumStock: Number(form.minimumStock),
            description: `Créé par scan le ${new Date().toLocaleDateString('fr-FR')}`,
          }),
        })
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Erreur création produit')
        productId = j._id
      }

      // Enregistre le mouvement IN
      const r = await fetch('/api/scan/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: Number(form.quantity),
          supplierId: form.supplierId || null,
          notes: form.notes,
        }),
      })

      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erreur enregistrement')

      onSuccess({
        productName: product?.name || form.name,
        sku: product?.sku || form.sku,
        quantity: form.quantity,
        isNew: !product,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid var(--card-border)',
    background: 'var(--card-bg)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const lbl = {
    display: 'block', fontSize: '12px', fontWeight: 600 as const,
    color: 'var(--muted)', marginBottom: '5px',
  }

  return (
    <div>
      {/* Code scanné */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', borderRadius: '12px',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        marginBottom: '20px',
      }}>
        <span style={{ fontSize: '24px' }}>🔍</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
            Code scanné
          </p>
          <p style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--foreground)' }}>
            {code}
          </p>
        </div>
        <button onClick={onRescan} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', borderRadius: '8px',
          border: '1px solid var(--card-border)', background: 'transparent',
          color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
        }}>
          <ArrowLeft size={14} /> Rescanner
        </button>
      </div>

      {/* Statut produit */}
      {product ? (
        <div style={{
          padding: '16px', borderRadius: '12px', marginBottom: '20px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '28px' }}>✅</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
              Produit reconnu
            </p>
            <p style={{ fontSize: '13px', color: '#16a34a' }}>
              {product.name} · Stock actuel : <strong>{product.currentStock}</strong> unités
            </p>
            {product.categoryId?.name && (
              <p style={{ fontSize: '12px', color: '#16a34a', opacity: 0.8 }}>
                {product.categoryId.name}
                {product.supplierId?.name && ` · ${product.supplierId.name}`}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '16px', borderRadius: '12px', marginBottom: '20px',
          background: '#fffbeb', border: '1px solid #fde68a',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '2px' }}>
              Nouveau produit
            </p>
            <p style={{ fontSize: '13px', color: '#b45309' }}>
              Ce code n'existe pas encore — remplissez les informations pour le créer.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Champs si nouveau produit */}
        {!product && (
          <div style={{
            padding: '20px', borderRadius: '12px',
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            marginBottom: '20px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Créer le produit
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Nom du produit *</label>
                <input style={inp} required value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="ex: Filtre à huile Toyota" />
              </div>
              <div>
                <label style={lbl}>SKU / Code</label>
                <input style={inp} value={form.sku}
                  onChange={e => set('sku', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Prix HT (€)</label>
                <input style={inp} type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Catégorie</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.categoryId}
                  onChange={e => set('categoryId', e.target.value)}>
                  <option value="">Choisir...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Seuil d'alerte</label>
                <input style={inp} type="number" min="0"
                  value={form.minimumStock}
                  onChange={e => set('minimumStock', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Réception */}
        <div style={{
          padding: '20px', borderRadius: '12px',
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} /> Détails de la réception
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Quantité reçue *</label>
              <input style={inp} type="number" min="1" required
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Fournisseur</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.supplierId}
                onChange={e => set('supplierId', e.target.value)}>
                <option value="">Sélectionner...</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Notes</label>
              <input style={inp} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="ex: Bon de livraison n°12345, colis en bon état..." />
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', fontSize: '13px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={saving} style={{
          width: '100%', padding: '14px',
          borderRadius: '12px',
          background: 'var(--domain-primary)', color: 'white',
          border: 'none', fontSize: '15px', fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          {saving ? 'Enregistrement…' : '✅ Confirmer la réception'}
        </button>
      </form>
    </div>
  )
}