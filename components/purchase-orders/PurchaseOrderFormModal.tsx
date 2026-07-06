'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, ShoppingCart } from 'lucide-react'

interface Props {
  prefillProducts: any[]
  onClose: () => void
  onSaved: () => void
}

interface OrderLine {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
}

export function PurchaseOrderFormModal({ prefillProducts, onClose, onSaved }: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [stocks, setStocks] = useState<any[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [expectedAt, setExpectedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<OrderLine[]>(
    prefillProducts.length > 0
      ? prefillProducts.map(p => ({
          productId: p._id,
          productName: p.name,
          productSku: p.sku,
          quantity: p.minimumStock - p.totalQuantity > 0
            ? p.minimumStock - p.totalQuantity
            : 1,
          unitPrice: p.price || 0,
        }))
      : []
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(d => setSuppliers(d.items || []))
    fetch('/api/stocks?search=').then(r => r.json()).then(d => setStocks(d.items || []))
  }, [])

  const filteredStocks = stocks.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8)

  function addProduct(product: any) {
    const exists = lines.find(l => l.productId === product._id)
    if (exists) return
    setLines(prev => [...prev, {
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unitPrice: product.price || 0,
    }])
    setSearch('')
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, key: keyof OrderLine, value: any) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: value } : l))
  }

  const totalHT = lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lines.length) { setError('Ajoutez au moins un article'); return }
    setError('')
    setLoading(true)

    const r = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, items: lines, notes, expectedAt }),
    })

    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    onSaved()
  }

  const input = {
    width: '100%', padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '13px', outline: 'none',
  }

  const label = {
    display: 'block', fontSize: '12px', fontWeight: 500 as const,
    color: 'var(--muted)', marginBottom: '4px',
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
          width: '100%', maxWidth: '640px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
              Nouvelle commande fournisseur
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px' }}>
          <form onSubmit={handleSubmit}>

            {/* Fournisseur + date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Fournisseur *</label>
                <select style={{ ...input, cursor: 'pointer' }} required value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}>
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Date de livraison prévue</label>
                <input style={input} type="date" value={expectedAt}
                  onChange={e => setExpectedAt(e.target.value)} />
              </div>
              <div>
                <label style={label}>Notes</label>
                <input style={input} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Instructions de livraison..." />
              </div>
            </div>

            {/* Recherche produits */}
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Ajouter des produits</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={input}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un produit par nom ou SKU…"
                />
                {search && filteredStocks.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--background)', border: '1px solid var(--card-border)',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden', marginTop: '4px',
                  }}>
                    {filteredStocks.map(s => (
                      <div
                        key={s._id}
                        onClick={() => addProduct(s)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', cursor: 'pointer',
                          borderBottom: '1px solid var(--card-border)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>{s.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {s.sku} — Stock actuel : {s.totalQuantity}
                            {s.etat !== 'OK' && (
                              <span style={{ color: s.etat === 'RUPTURE' ? '#dc2626' : '#d97706', marginLeft: '4px' }}>
                                ({s.etat})
                              </span>
                            )}
                          </p>
                        </div>
                        <Plus size={14} color="#3b82f6" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lignes de commande */}
            {lines.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 30px', gap: '8px', marginBottom: '6px' }}>
                  {['Produit', 'Qté', 'Prix unit. HT', ''].map(h => (
                    <p key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>{h}</p>
                  ))}
                </div>
                {lines.map((line, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 30px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>{line.productName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>{line.productSku}</p>
                    </div>
                    <input
                      style={input} type="number" min="1" value={line.quantity}
                      onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                    />
                    <input
                      style={input} type="number" min="0" step="0.01" value={line.unitPrice}
                      onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))}
                      placeholder="0.00"
                    />
                    <button type="button" onClick={() => removeLine(i)} style={{
                      width: '30px', height: '30px', borderRadius: '6px',
                      border: '1px solid #fecaca', background: 'transparent',
                      color: '#dc2626', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  marginTop: '8px',
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Total HT estimé</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)' }}>
                      {totalHT.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!lines.length && (
              <div style={{
                textAlign: 'center', padding: '24px', borderRadius: '10px',
                background: 'var(--card-bg)', border: '1px dashed var(--card-border)',
                marginBottom: '20px', color: 'var(--muted)', fontSize: '13px',
              }}>
                Recherchez des produits ci-dessus pour les ajouter à la commande
              </div>
            )}

            {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--card-border)',
                background: 'transparent', color: 'var(--foreground)',
                fontSize: '14px', cursor: 'pointer',
              }}>Annuler</button>
              <button type="submit" disabled={loading} style={{
                padding: '10px 20px', borderRadius: '10px',
                background: '#3b82f6', color: 'white', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Création…' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}