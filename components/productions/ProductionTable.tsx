'use client'

import { Production } from './ProductionsClient'
import { Eye, Trash2, CheckCircle, Archive, IdCard } from 'lucide-react'

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  EN_COURS: { bg: '#eff6ff', color: '#1d4ed8', label: '🔵 En cours' },
  TERMINE:  { bg: '#f0fdf4', color: '#16a34a', label: '✅ Terminé' },
  ARCHIVE:  { bg: '#f1f5f9', color: '#64748b', label: '📦 Archivé' },
}

interface Props {
  items: Production[]
  loading: boolean
  onDetail: (item: Production) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: string) => void
  onIdentity: (item: Production) => void
}

export function ProductionTable({ items, loading, onDetail, onDelete, onChangeStatus, onIdentity }: Props) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>Chargement…</div>
  )

  if (!items.length) return (
    <div style={{
      textAlign: 'center', padding: '48px', color: 'var(--muted)',
      background: 'var(--card-bg)', borderRadius: '14px',
      border: '1px solid var(--card-border)',
    }}>
      Aucune production — créez la première.
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
              {['Statut', 'Référence', 'Nom', 'Composants', 'Créée le', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
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
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '13px' }}>
                    {item.ref}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--foreground)' }}>
                    {item.name}
                    {item.description && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400, marginTop: '2px' }}>
                        {item.description.slice(0, 60)}{item.description.length > 60 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>
                    <span style={{
                      background: 'var(--card-border)', color: 'var(--foreground)',
                      padding: '2px 8px', borderRadius: '10px', fontSize: '12px',
                    }}>
                      {item.components?.length || 0} pièce{(item.components?.length || 0) > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '13px' }}>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onDetail(item)}
                        title="Voir le détail et ajouter des composants"
                        style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          border: '1px solid var(--card-border)', background: 'transparent',
                          color: '#3b82f6', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onIdentity(item)}
                        title="Carte d'identité de la production"
                        style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          border: '1px solid #e9d5ff', background: '#f5f3ff',
                          color: '#7c3aed', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <IdCard size={14} />
                      </button>
                      {item.status === 'EN_COURS' && (
                        <button
                          onClick={() => onChangeStatus(item._id, 'TERMINE')}
                          title="Marquer comme terminé"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #bbf7d0', background: '#f0fdf4',
                            color: '#16a34a', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {item.status === 'TERMINE' && (
                        <button
                          onClick={() => onChangeStatus(item._id, 'ARCHIVE')}
                          title="Archiver"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid var(--card-border)', background: 'transparent',
                            color: 'var(--muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Archive size={14} />
                        </button>
                      )}
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}