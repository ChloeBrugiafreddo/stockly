'use client'

import { useState } from 'react'
import { StockItem } from './StockPageClient'
import { Pencil, Trash2, Plus, Minus, History, IdCard, ChevronDown, ChevronRight } from 'lucide-react'

const etatConfig = {
  OK:      { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'OK' },
  BAS:     { bg: '#fffbeb', color: '#d97706', dot: '#d97706', label: 'Bas' },
  RUPTURE: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Rupture' },
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

function btnStyle(bg: string, border: string, color: string) {
  return {
    width: '28px', height: '28px', borderRadius: '7px',
    border: `1px solid ${border}`,
    background: bg, color,
    cursor: 'pointer', display: 'flex' as const,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    flexShrink: 0 as const, transition: 'transform 0.1s',
  }
}

export function StockTable({ items, loading, onEdit, onDelete, onMovement, onHistory, onIdentity, onOrder }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  function toggleCategory(cat: string) {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
      Chargement…
    </div>
  )

  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '60px',
      background: 'var(--card-bg)', borderRadius: '16px',
      border: '2px dashed var(--card-border)',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
        Aucun produit
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
        Ajoutez votre premier article en stock.
      </p>
    </div>
  )

  // Groupe par catégorie
  const grouped = items.reduce((acc, item) => {
    const cat = item.categoryId?.name || 'Sans catégorie'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, StockItem[]>)

  // Trie les catégories : celles avec des ruptures/bas en premier
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aHasAlert = grouped[a].some(i => i.etat !== 'OK')
    const bHasAlert = grouped[b].some(i => i.etat !== 'OK')
    if (aHasAlert && !bHasAlert) return -1
    if (!aHasAlert && bHasAlert) return 1
    return a.localeCompare(b)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {sortedCategories.map(category => {
        const catItems = grouped[category]
        const isCollapsed = collapsedCategories.has(category)
        const alerts = catItems.filter(i => i.etat !== 'OK').length
        const ruptures = catItems.filter(i => i.etat === 'RUPTURE').length
        const bas = catItems.filter(i => i.etat === 'BAS').length
        const totalQty = catItems.reduce((sum, i) => sum + i.totalQuantity, 0)
        const totalValue = catItems.reduce((sum, i) => sum + i.totalQuantity * i.price, 0)

        return (
          <div key={category} style={{
            background: 'var(--card-bg)',
            border: `1px solid ${alerts > 0 ? (ruptures > 0 ? '#fecaca' : '#fde68a') : 'var(--card-border)'}`,
            borderRadius: '14px', overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}>
            {/* Header catégorie */}
            <div
              onClick={() => toggleCategory(category)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', cursor: 'pointer',
                background: alerts > 0
                  ? (ruptures > 0 ? '#fef2f2' : '#fffbeb')
                  : 'var(--card-bg)',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)',
                transition: 'background 0.15s',
                userSelect: 'none' as const,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isCollapsed
                  ? <ChevronRight size={16} color="var(--muted)" />
                  : <ChevronDown size={16} color="var(--muted)" />
                }
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>
                  {category}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', background: 'var(--card-border)',
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  {catItems.length} article{catItems.length > 1 ? 's' : ''}
                </span>
                {ruptures > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                    🔴 {ruptures} rupture{ruptures > 1 ? 's' : ''}
                  </span>
                )}
                {bas > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    ⚠️ {bas} bas
                  </span>
                )}
              </div>

              {/* Stats rapides */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '1px' }}>Total unités</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>{totalQty}</p>
                </div>
                {totalValue > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '1px' }}>Valeur HT</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--domain-primary, #3b82f6)' }}>
                      {totalValue.toFixed(0)} €
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Lignes du tableau */}
            {!isCollapsed && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                   {['État', 'SKU', 'Produit', 'Fournisseur', 'Qté', 'Seuil', 'Prix unit.', ''].map(h => (
                      <th key={h} style={{
                        padding: '9px 16px', textAlign: 'left',
                        fontSize: '10px', fontWeight: 700,
                        color: 'var(--muted)', letterSpacing: '0.5px',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                        background: 'var(--card-bg)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catItems.map((item, i) => {
                    const cfg = etatConfig[item.etat]
                    const isHovered = hoveredId === item._id
                    const isLast = i === catItems.length - 1

                    return (
                      <tr
                        key={item._id}
                        onMouseEnter={() => setHoveredId(item._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid var(--card-border)',
                          background: isHovered ? 'rgba(0,0,0,0.02)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        {/* État */}
                        <td style={{ padding: '12px 16px', width: '100px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 7px', borderRadius: '20px' }}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)' }}>
                            {item.sku}
                          </span>
                        </td>

                        {/* Nom */}
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: item.description ? '2px' : 0 }}>
                            {item.name}
                          </p>
                          {item.description && (
                            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {item.description.slice(0, 50)}{item.description.length > 50 ? '…' : ''}
                            </p>
                          )}
                        </td>

                        {/* Fournisseur */}
                        <td style={{ padding: '12px 16px' }}>
                          {item.supplierId?.name ? (
                            <span style={{
                              fontSize: '12px', color: 'var(--muted)',
                              background: 'var(--card-border)',
                              padding: '2px 8px', borderRadius: '6px',
                            }}>
                              {item.supplierId.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>—</span>
                          )}
                        </td>

                        {/* Quantité */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px',
                            color: item.etat === 'RUPTURE' ? '#dc2626' : item.etat === 'BAS' ? '#d97706' : 'var(--foreground)',
                          }}>
                            {item.totalQuantity}
                          </span>
                        </td>

                        {/* Seuil */}
                        <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '13px' }}>
                          {item.minimumStock}
                        </td>

                        {/* Prix */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>
                            {item.price > 0 ? `${item.price.toFixed(2)} €` : '—'}
                          </span>
                        </td>

                        {/* Actions au hover */}
                        <td style={{ padding: '12px 16px', width: '180px' }}>
                          <div style={{
                            display: 'flex', gap: '4px', alignItems: 'center',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.15s',
                          }}>
                            <button onClick={() => onMovement(item, 'IN')} title="Entrée stock"
                              style={btnStyle('#f0fdf4', '#bbf7d0', '#16a34a')}>
                              <Plus size={12} />
                            </button>
                            <button onClick={() => onMovement(item, 'OUT')} title="Sortie stock"
                              style={btnStyle('#fef2f2', '#fecaca', '#dc2626')}>
                              <Minus size={12} />
                            </button>
                            <div style={{ width: '1px', height: '18px', background: 'var(--card-border)', margin: '0 2px' }} />
                            <button onClick={() => onHistory(item)} title="Historique"
                              style={btnStyle('transparent', 'var(--card-border)', 'var(--muted)')}>
                              <History size={12} />
                            </button>
                            <button onClick={() => onIdentity(item)} title="Carte d'identité"
                              style={btnStyle('#f5f3ff', '#e9d5ff', '#7c3aed')}>
                              <IdCard size={12} />
                            </button>
                            <button onClick={() => onEdit(item)} title="Modifier"
                              style={btnStyle('transparent', 'var(--card-border)', 'var(--muted)')}>
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => onDelete(item._id)} title="Supprimer"
                              style={btnStyle('transparent', 'var(--card-border)', '#dc2626')}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}