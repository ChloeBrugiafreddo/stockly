'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Search } from 'lucide-react'
import { Production, Component } from './ProductionsClient'

interface Props {
  production: Production
  onClose: () => void
}

export function ProductionDetailModal({ production, onClose }: Props) {
  const [data, setData] = useState<Production>(production)
  const [stocks, setStocks] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [quantity, setQuantity] = useState('1')
  const [addedBy, setAddedBy] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState(false)

  async function refreshProduction() {
    const r = await fetch(`/api/productions?search=`)
    const j = await r.json()
    const found = j.items?.find((p: Production) => p._id === production._id)
    if (found) setData(found)
  }

  async function searchStocks() {
    setLoadingStocks(true)
    try {
      const r = await fetch(`/api/stocks?search=${encodeURIComponent(search)}`)
      const j = await r.json()
      setStocks(j.items || [])
    } finally {
      setLoadingStocks(false)
    }
  }

  useEffect(() => { searchStocks() }, [])

  async function handleAddComponent(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPart) { setError('Sélectionnez un produit'); return }
    setError('')
    setLoading(true)

    const r = await fetch(`/api/productions/${production._id}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedPart._id,
        quantity: Number(quantity),
        addedBy,
      }),
    })
    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }

    setSelectedPart(null)
    setQuantity('1')
    setAddedBy('')
    await refreshProduction()
    await searchStocks()
  }

  async function handleRemoveComponent(componentId: string) {
    if (!confirm('Retirer ce composant ? Il sera remis en stock.')) return
    const r = await fetch(`/api/productions/${production._id}/components/${componentId}`, {
      method: 'DELETE',
    })
    if (!r.ok) { alert('Erreur'); return }
    await refreshProduction()
    await searchStocks()
  }

  const statusColors: Record<string, string> = {
    EN_COURS: '#1d4ed8', TERMINE: '#16a34a', ARCHIVE: '#64748b',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '700px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
                {data.name}
              </h2>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px',
                background: '#eff6ff', color: statusColors[data.status],
              }}>
                {data.status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Réf : <span style={{ fontFamily: 'monospace' }}>{data.ref}</span>
              {data.description && ` — ${data.description}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Composants déjà montés */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px' }}>
              Composants utilisés ({data.components?.length || 0})
            </h3>
            {!data.components?.length ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucun composant ajouté pour l'instant.</p>
            ) : (
              <div style={{
                border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      {['Réf', 'Nom', 'Qté', 'Ajouté par', 'Date', ''].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.components.map((c, i) => (
                      <tr key={c._id} style={{
                        borderBottom: i < data.components.length - 1 ? '1px solid var(--card-border)' : 'none',
                      }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--muted)' }}>{c.ref}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--foreground)', fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--foreground)' }}>{c.quantity}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{c.addedBy || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>
                          {new Date(c.addedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {data.status === 'EN_COURS' && (
                            <button
                              onClick={() => handleRemoveComponent(c._id)}
                              style={{
                                width: '26px', height: '26px', borderRadius: '6px',
                                border: '1px solid #fecaca', background: 'transparent',
                                color: '#dc2626', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ajouter un composant */}
          {data.status === 'EN_COURS' && (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '14px' }}>
                Ajouter un composant depuis le stock
              </h3>

              {/* Recherche produit */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{
                    position: 'absolute', left: '10px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--muted)',
                  }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchStocks()}
                    placeholder="Rechercher une pièce par nom ou SKU…"
                    style={{
                      width: '100%', padding: '8px 10px 8px 32px',
                      borderRadius: '8px', border: '1px solid var(--card-border)',
                      background: 'var(--background)', color: 'var(--foreground)',
                      fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={searchStocks}
                  style={{
                    padding: '8px 14px', borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--background)', color: 'var(--foreground)',
                    fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Chercher
                </button>
              </div>

              {/* Liste des produits */}
              {loadingStocks ? (
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement…</p>
              ) : stocks.length > 0 && (
                <div style={{
                  border: '1px solid var(--card-border)', borderRadius: '8px',
                  overflow: 'hidden', marginBottom: '14px', maxHeight: '160px', overflowY: 'auto',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      {stocks.map((s, i) => (
                        <tr
                          key={s._id}
                          onClick={() => setSelectedPart(s)}
                          style={{
                            borderBottom: i < stocks.length - 1 ? '1px solid var(--card-border)' : 'none',
                            cursor: 'pointer',
                            background: selectedPart?._id === s._id ? 'var(--accent-light)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '12px' }}>
                            {s.sku}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--foreground)', fontWeight: selectedPart?._id === s._id ? 600 : 400 }}>
                            {s.name}
                          </td>
                          <td style={{ padding: '8px 12px', color: s.totalQuantity === 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                            Stock : {s.totalQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Formulaire ajout */}
              {selectedPart && (
                <form onSubmit={handleAddComponent}>
                  <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: '8px', padding: '10px 14px', marginBottom: '12px',
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>
                      ✓ Sélectionné : {selectedPart.name}
                      <span style={{ fontFamily: 'monospace', marginLeft: '8px', fontWeight: 400 }}>
                        ({selectedPart.sku}) — Stock dispo : {selectedPart.totalQuantity}
                      </span>
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted)', marginBottom: '4px' }}>
                        Quantité *
                      </label>
                      <input
                        type="number" min="1" max={selectedPart.totalQuantity} required
                        value={quantity} onChange={e => setQuantity(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '8px',
                          border: '1px solid var(--card-border)',
                          background: 'var(--background)', color: 'var(--foreground)',
                          fontSize: '13px', outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--muted)', marginBottom: '4px' }}>
                        Technicien / Responsable
                      </label>
                      <input
                        type="text" value={addedBy} onChange={e => setAddedBy(e.target.value)}
                        placeholder="Nom du responsable"
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '8px',
                          border: '1px solid var(--card-border)',
                          background: 'var(--background)', color: 'var(--foreground)',
                          fontSize: '13px', outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={loading} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 16px', borderRadius: '8px',
                      background: '#3b82f6', color: 'white', border: 'none',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}>
                      <Plus size={14} />
                      {loading ? 'Ajout…' : 'Ajouter à la production'}
                    </button>
                    <button type="button" onClick={() => setSelectedPart(null)} style={{
                      padding: '9px 16px', borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'transparent', color: 'var(--muted)',
                      fontSize: '13px', cursor: 'pointer',
                    }}>
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}