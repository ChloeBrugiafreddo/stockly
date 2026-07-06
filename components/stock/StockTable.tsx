'use client'

import { StockItem } from './StockPageClient'
import { Pencil, Trash2, Plus, Minus, History, IdCard, ShoppingCart } from 'lucide-react'

const etatStyles = {
  OK:      { background: '#f0fdf4', color: '#16a34a' },
  BAS:     { background: '#fffbeb', color: '#d97706' },
  RUPTURE: { background: '#fef2f2', color: '#dc2626' },
}

interface Props {
  items: StockItem[]
  loading: boolean
  onEdit: (item: StockItem) => void
  onDelete: (id: string) => void
  onMovement: (item: StockItem, type: 'IN' | 'OUT') => void
  onHistory: (item: StockItem) => void
  onIdentity: (item: StockItem) => void
  onOrder: (item: StockItem) => void
}

export function StockTable({ items, loading, onEdit, onDelete, onMovement, onHistory, onIdentity, onOrder }: Props) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
      Chargement…
    </div>
  )

  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '48px', color: 'var(--muted)',
      background: 'var(--card-bg)', borderRadius: '14px',
      border: '1px solid var(--card-border)',
    }}>
      Aucun produit — ajoutez votre premier article.
    </div>
  )

  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: '14px', overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['État', 'SKU', 'Nom', 'Catégorie', 'Qté', 'Seuil', 'Prix', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item._id}
                style={{
                  borderBottom: i < items.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}
              >
                {/* État */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    ...etatStyles[item.etat],
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 600,
                  }}>
                    {item.etat}
                  </span>
                </td>

                {/* SKU */}
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '13px' }}>
                  {item.sku}
                </td>

                {/* Nom */}
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--foreground)' }}>
                  {item.name}
                  {item.description && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400, marginTop: '2px' }}>
                      {item.description.slice(0, 50)}{item.description.length > 50 ? '…' : ''}
                    </div>
                  )}
                </td>

                {/* Catégorie */}
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                  {item.categoryId?.name || '—'}
                </td>

                {/* Quantité */}
                <td style={{
                  padding: '12px 16px', fontWeight: 700,
                  color: item.etat === 'RUPTURE' ? '#dc2626' : item.etat === 'BAS' ? '#d97706' : 'var(--foreground)',
                }}>
                  {item.totalQuantity}
                </td>

                {/* Seuil */}
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                  {item.minimumStock}
                </td>

                {/* Prix */}
                <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>
                  {item.price > 0 ? `${item.price.toFixed(2)} €` : '—'}
                </td>

                {/* Actions */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => onMovement(item, 'IN')}
                      title="Ajouter du stock"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid #bbf7d0', background: '#f0fdf4',
                        color: '#16a34a', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => onMovement(item, 'OUT')}
                      title="Retirer du stock"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid #fecaca', background: '#fef2f2',
                        color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    
                    <button
                      onClick={() => onHistory(item)}
                      title="Historique des mouvements"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid var(--card-border)', background: 'transparent',
                        color: 'var(--muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <History size={14} />
                    </button>
                    <button
                      onClick={() => onIdentity(item)}
                      title="Carte d'identité du produit"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid #e9d5ff', background: '#f5f3ff',
                        color: '#7c3aed', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <IdCard size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      title="Modifier"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid var(--card-border)', background: 'transparent',
                        color: 'var(--muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      title="Supprimer"
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid #fecaca', background: 'transparent',
                        color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}