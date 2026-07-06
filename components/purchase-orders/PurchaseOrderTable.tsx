'use client'

import { PurchaseOrder } from './PurchaseOrdersClient'
import { Send, CheckCircle, XCircle, Trash2, Package } from 'lucide-react'

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyée' },
  RECEIVED:  { bg: '#f0fdf4', color: '#16a34a', label: '✅ Reçue' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulée' },
}

interface Props {
  items: PurchaseOrder[]
  loading: boolean
  onChangeStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export function PurchaseOrderTable({ items, loading, onChangeStatus, onDelete }: Props) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>Chargement…</div>
  )

  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '48px', color: 'var(--muted)',
      background: 'var(--card-bg)', borderRadius: '14px',
      border: '1px solid var(--card-border)',
    }}>
      <Package size={32} color="var(--muted)" style={{ marginBottom: '12px' }} />
      <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Aucune commande fournisseur</p>
      <p style={{ fontSize: '13px' }}>Créez une commande depuis ici ou directement depuis la page Stock.</p>
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
              {['Statut', 'Fournisseur', 'Articles', 'Total HT', 'Livraison prévue', 'Créée le', 'Actions'].map(h => (
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
            {items.map((item, i) => {
              const st = statusStyles[item.status]
              return (
                <tr key={item._id} style={{
                  borderBottom: i < items.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: st.bg, color: st.color,
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--foreground)' }}>
                    {item.supplierId?.name || '—'}
                    {item.supplierId?.email && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>
                        {item.supplierId.email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.items.slice(0, 2).map((it, idx) => (
                        <span key={idx} style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {it.productName} × {it.quantity}
                        </span>
                      ))}
                      {item.items.length > 2 && (
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          +{item.items.length - 2} autre{item.items.length - 2 > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--foreground)' }}>
                    {item.totalPrice > 0 ? `${item.totalPrice.toFixed(2)} €` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '13px' }}>
                    {item.expectedAt ? new Date(item.expectedAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '13px' }}>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {item.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => onChangeStatus(item._id, 'SENT')}
                            title="Marquer comme envoyée"
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              border: '1px solid #bfdbfe', background: '#eff6ff',
                              color: '#1d4ed8', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Send size={14} />
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
                        </>
                      )}
                      {item.status === 'SENT' && (
                        <>
                          <button
                            onClick={() => onChangeStatus(item._id, 'RECEIVED')}
                            title="Marquer comme reçue — met à jour le stock"
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              border: '1px solid #bbf7d0', background: '#f0fdf4',
                              color: '#16a34a', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => onChangeStatus(item._id, 'CANCELLED')}
                            title="Annuler"
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              border: '1px solid #fecaca', background: 'transparent',
                              color: '#dc2626', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}