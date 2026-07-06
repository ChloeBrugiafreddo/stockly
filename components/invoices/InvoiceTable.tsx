'use client'

import { Invoice, toTTC } from './InvoicesClient'
import { Eye, Trash2, Send, CheckCircle, XCircle } from 'lucide-react'

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyé' },
  PAID:      { bg: '#f0fdf4', color: '#16a34a', label: '✅ Accepté' },
  OVERDUE:   { bg: '#fffbeb', color: '#d97706', label: '⚠️ Expiré' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulé' },
}

interface Props {
  items: Invoice[]
  loading: boolean
  onDetail: (item: Invoice) => void
  onChangeStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export function InvoiceTable({ items, loading, onDetail, onChangeStatus, onDelete }: Props) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>Chargement…</div>
  )

  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '48px', color: 'var(--muted)',
      background: 'var(--card-bg)', borderRadius: '14px',
      border: '1px solid var(--card-border)',
    }}>
      Aucun devis — créez le premier.
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
              {['Statut', 'Numéro', 'Client', 'Total HT', 'TVA 20%', 'Total TTC', 'Échéance', 'Actions'].map(h => (
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
              const tva = item.amount * 0.20
              const ttc = toTTC(item.amount)
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
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '13px' }}>
                    {item.invoiceNumber}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--foreground)' }}>
                    {item.customerName}
                    {item.customerEmail && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>
                        {item.customerEmail}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>
                    {item.amount.toFixed(2)} €
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                    {tva.toFixed(2)} €
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--foreground)' }}>
                    {ttc.toFixed(2)} €
                  </td>
                  <td style={{ padding: '12px 16px', color: item.status === 'OVERDUE' ? '#d97706' : 'var(--muted)', fontSize: '13px' }}>
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => onDetail(item)} title="Voir le détail" style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid var(--card-border)', background: 'transparent',
                        color: '#3b82f6', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Eye size={14} />
                      </button>
                      {item.status === 'DRAFT' && (
                        <>
                          <button onClick={() => onChangeStatus(item._id, 'SENT')} title="Marquer comme envoyé" style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #bfdbfe', background: '#eff6ff',
                            color: '#1d4ed8', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Send size={14} />
                          </button>
                          <button onClick={() => onDelete(item._id)} title="Supprimer" style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #fecaca', background: 'transparent',
                            color: '#dc2626', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      {item.status === 'SENT' && (
                        <>
                          <button onClick={() => onChangeStatus(item._id, 'PAID')} title="Marquer comme accepté" style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #bbf7d0', background: '#f0fdf4',
                            color: '#16a34a', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => onChangeStatus(item._id, 'CANCELLED')} title="Annuler" style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #fecaca', background: 'transparent',
                            color: '#dc2626', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
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