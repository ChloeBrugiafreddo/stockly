'use client'

import { useEffect, useState } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { StockItem } from './StockPageClient'

interface Movement {
  _id: string
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'
  quantity: number
  reason: string
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

interface Props {
  item: StockItem
  onClose: () => void
}

export function HistoryModal({ item, onClose }: Props) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stocks/${item._id}/movements`)
      .then(r => r.json())
      .then(d => setMovements(d.items || []))
      .finally(() => setLoading(false))
  }, [item._id])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
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
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '600px',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
              Historique des mouvements
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              {item.name} — <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ overflowY: 'auto', padding: '16px 28px 28px' }}>
          {loading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>Chargement…</p>
          ) : movements.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>
              Aucun mouvement enregistré pour ce produit.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {movements.map(m => (
                <div key={m._id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                }}>
                  {/* Icône */}
                  <div style={{ flexShrink: 0 }}>
                    {m.movementType === 'IN'
                      ? <ArrowUpCircle size={22} color="#16a34a" />
                      : <ArrowDownCircle size={22} color="#dc2626" />
                    }
                  </div>

                  {/* Détails */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        color: m.movementType === 'IN' ? '#16a34a' : '#dc2626',
                      }}>
                        {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>
                        {m.reason || (m.movementType === 'IN' ? 'Entrée de stock' : 'Sortie de stock')}
                      </span>
                    </div>
                    {/* Référence produit final si applicable */}
                    {m.referenceId && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        Réf. {m.referenceType} : <span style={{ fontFamily: 'monospace' }}>{m.referenceId}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatDate(m.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}