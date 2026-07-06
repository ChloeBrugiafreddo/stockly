'use client'

import { useEffect, useState } from 'react'
import {
  X, ArrowUpCircle, ArrowDownCircle, Package,
  Factory, FileText, Tag, TrendingUp, TrendingDown
} from 'lucide-react'
import { StockItem } from './StockPageClient'

interface Props {
  item: StockItem
  onClose: () => void
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  EN_COURS: { bg: '#eff6ff', color: '#1d4ed8', label: '🔵 En cours' },
  TERMINE:  { bg: '#f0fdf4', color: '#16a34a', label: '✅ Terminé' },
  ARCHIVE:  { bg: '#f1f5f9', color: '#64748b', label: '📦 Archivé' },
}

export function ProductIdentityModal({ item, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'productions' | 'custom'>('overview')

  useEffect(() => {
    fetch(`/api/stocks/${item._id}/identity`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [item._id])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const tabs = [
    { id: 'overview',    label: 'Vue d\'ensemble', icon: Package },
    { id: 'movements',   label: `Mouvements${data ? ` (${data.stats.totalMovements})` : ''}`, icon: TrendingUp },
    { id: 'productions', label: `Productions${data ? ` (${data.productions.length})` : ''}`, icon: Factory },
    { id: 'custom',      label: 'Champs custom', icon: Tag },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '720px',
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
                {item.name}
              </h2>
              <span style={{
                fontSize: '12px', fontFamily: 'monospace',
                background: 'var(--card-bg)', color: 'var(--muted)',
                padding: '2px 8px', borderRadius: '6px',
                border: '1px solid var(--card-border)',
              }}>
                {item.sku}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Carte d'identité complète du produit
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex', gap: '2px', padding: '12px 28px 0',
          borderBottom: '1px solid var(--card-border)',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', border: 'none', background: 'transparent',
                  color: active ? 'var(--accent-text)' : 'var(--muted)',
                  fontSize: '13px', fontWeight: active ? 600 : 400,
                  cursor: 'pointer', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Contenu */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
              Chargement de la carte d'identité…
            </div>
          ) : !data ? (
            <p style={{ color: '#dc2626' }}>Erreur de chargement</p>
          ) : (
            <>
              {/* ── VUE D'ENSEMBLE ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Stats rapides */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'Stock actuel', value: data.stock?.quantity || 0, color: item.etat === 'RUPTURE' ? '#dc2626' : item.etat === 'BAS' ? '#d97706' : '#16a34a' },
                      { label: 'Total entrées', value: data.stats.totalIn, color: '#16a34a' },
                      { label: 'Total sorties', value: data.stats.totalOut, color: '#dc2626' },
                      { label: 'Productions', value: data.stats.usedInProductions, color: '#7c3aed' },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        borderRadius: '10px', padding: '14px',
                        textAlign: 'center',
                      }}>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Infos produit */}
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    borderRadius: '12px', padding: '18px',
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '14px' }}>
                      Informations produit
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'Référence SKU', value: data.product.sku },
                        { label: 'Prix unitaire', value: data.product.price > 0 ? `${data.product.price.toFixed(2)} €` : '—' },
                        { label: 'Catégorie', value: data.product.categoryId?.name || '—' },
                        { label: 'Statut', value: data.product.status },
                        { label: 'Seuil d\'alerte', value: data.stock?.minimumStock || 0 },
                        { label: 'Créé le', value: new Date(data.product.createdAt).toLocaleDateString('fr-FR') },
                      ].map(info => (
                        <div key={info.label}>
                          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>{info.label}</p>
                          <p style={{ fontSize: '14px', color: 'var(--foreground)', fontWeight: 500 }}>{info.value}</p>
                        </div>
                      ))}
                    </div>
                    {data.product.description && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Description</p>
                        <p style={{ fontSize: '13px', color: 'var(--foreground)' }}>{data.product.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Fournisseur */}
                  {data.product.supplierId && (
                    <div style={{
                      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                      borderRadius: '12px', padding: '18px',
                    }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px' }}>
                        Fournisseur principal
                      </h3>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                        {data.product.supplierId.name}
                      </p>
                      {data.product.supplierId.email && (
                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                          {data.product.supplierId.email}
                        </p>
                      )}
                      {data.product.supplierId.phone && (
                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                          {data.product.supplierId.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── MOUVEMENTS ── */}
              {activeTab === 'movements' && (
                <div>
                  {data.movements.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucun mouvement enregistré.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.movements.map((m: any) => (
                        <div key={m._id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: '10px',
                          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        }}>
                          {m.movementType === 'IN'
                            ? <ArrowUpCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                            : <ArrowDownCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                          }
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>
                              {m.reason || (m.movementType === 'IN' ? 'Entrée de stock' : 'Sortie de stock')}
                            </p>
                            {m.referenceType && m.referenceType !== 'manual' && (
                              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                                Via : {m.referenceType}
                              </p>
                            )}
                          </div>
                          <span style={{
                            fontSize: '15px', fontWeight: 700,
                            color: m.movementType === 'IN' ? '#16a34a' : '#dc2626',
                            flexShrink: 0,
                          }}>
                            {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0, minWidth: '110px', textAlign: 'right' }}>
                            {formatDate(m.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── PRODUCTIONS ── */}
              {activeTab === 'productions' && (
                <div>
                  {data.productions.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      Ce produit n'a été utilisé dans aucune production.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.productions.map((p: any) => {
                        const st = statusStyles[p.status]
                        return (
                          <div key={p._id} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '14px 16px', borderRadius: '10px',
                            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                          }}>
                            <Factory size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                                {p.name}
                                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>
                                  {p.ref}
                                </span>
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                {p.addedBy && `Par : ${p.addedBy} — `}
                                {p.addedAt && `Le ${new Date(p.addedAt).toLocaleDateString('fr-FR')}`}
                              </p>
                            </div>
                            <span style={{
                              fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                              borderRadius: '20px', background: st.bg, color: st.color,
                              flexShrink: 0,
                            }}>
                              {st.label}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>
                              ×{p.quantity}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── CHAMPS CUSTOM ── */}
              {activeTab === 'custom' && (
                <div>
                  {data.customValues.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      Aucune valeur personnalisée enregistrée pour ce produit.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {data.customValues.map((v: any, i: number) => (
                        <div key={i} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                          borderRadius: '10px', padding: '14px 16px',
                        }}>
                          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{v.label}</p>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                            {v.value === 'true' ? 'Oui' : v.value === 'false' ? 'Non' : v.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}