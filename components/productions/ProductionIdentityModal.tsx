'use client'

import { useEffect, useState } from 'react'
import {
  X, Package, FileText, TrendingUp,
  ArrowUpCircle, ArrowDownCircle, Euro
} from 'lucide-react'
import { Production } from './ProductionsClient'

interface Props {
  production: Production
  onClose: () => void
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  EN_COURS: { bg: '#eff6ff', color: '#1d4ed8', label: '🔵 En cours' },
  TERMINE:  { bg: '#f0fdf4', color: '#16a34a', label: '✅ Terminé' },
  ARCHIVE:  { bg: '#f1f5f9', color: '#64748b', label: '📦 Archivé' },
}

const invoiceStatusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyée' },
  PAID:      { bg: '#f0fdf4', color: '#16a34a', label: '✅ Payée' },
  OVERDUE:   { bg: '#fffbeb', color: '#d97706', label: '⚠️ En retard' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulée' },
}

export function ProductionIdentityModal({ production, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'invoices' | 'movements'>('overview')

  useEffect(() => {
    fetch(`/api/productions/${production._id}/identity`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [production._id])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const st = statusStyles[production.status]

  const tabs = [
    { id: 'overview',   label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'components', label: `Composants${data ? ` (${data.stats.totalComponents})` : ''}`, icon: Package },
    { id: 'invoices',   label: `Devis${data ? ` (${data.invoices.length})` : ''}`, icon: FileText },
    { id: 'movements',  label: `Mouvements${data ? ` (${data.movements.length})` : ''}`, icon: ArrowDownCircle },
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
          width: '100%', maxWidth: '760px',
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
                {production.name}
              </h2>
              <span style={{
                fontSize: '12px', fontFamily: 'monospace',
                background: 'var(--card-bg)', color: 'var(--muted)',
                padding: '2px 8px', borderRadius: '6px',
                border: '1px solid var(--card-border)',
              }}>
                {production.ref}
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                borderRadius: '20px', background: st.bg, color: st.color,
              }}>
                {st.label}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Carte d'identité complète de la production
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
                  cursor: 'pointer',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
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

                  {/* Stats financières */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'Coût des composants', value: `${data.stats.totalComponentsCost.toFixed(2)} €`, color: '#dc2626', icon: Package },
                      { label: 'CA HT (devis)', value: `${data.stats.totalInvoiced.toFixed(2)} €`, color: '#1d4ed8', icon: FileText },
                        { label: 'Marge brute HT', value: `${data.stats.margin.toFixed(2)} €`, color: data.stats.margin >= 0 ? '#16a34a' : '#dc2626', icon: Euro },
                    ].map(stat => {
                      const Icon = stat.icon
                      return (
                        <div key={stat.label} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                          borderRadius: '12px', padding: '16px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Icon size={16} color={stat.color} />
                            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{stat.label}</p>
                          </div>
                          <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>
                            {stat.value}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Infos production */}
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    borderRadius: '12px', padding: '18px',
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '14px' }}>
                      Informations
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'Référence', value: production.ref },
                        { label: 'Statut', value: st.label },
                        { label: 'Composants utilisés', value: `${data.stats.totalComponents} pièce(s)` },
                        { label: 'Quantité totale utilisée', value: data.stats.totalQuantityUsed },
                        { label: 'Créée le', value: new Date(production.createdAt).toLocaleDateString('fr-FR') },
                        { label: 'Devis liés', value: data.invoices.length },
                      ].map(info => (
                        <div key={info.label}>
                          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>{info.label}</p>
                          <p style={{ fontSize: '14px', color: 'var(--foreground)', fontWeight: 500 }}>{info.value}</p>
                        </div>
                      ))}
                    </div>
                    {production.description && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Description</p>
                        <p style={{ fontSize: '13px', color: 'var(--foreground)' }}>{production.description}</p>
                      </div>
                    )}
                    {production.notes && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Notes</p>
                        <p style={{ fontSize: '13px', color: 'var(--foreground)' }}>{production.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── COMPOSANTS ── */}
              {activeTab === 'components' && (
                <div>
                  {data.production.components.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucun composant.</p>
                  ) : (
                    <>
                      <div style={{
                        border: '1px solid var(--card-border)', borderRadius: '12px',
                        overflow: 'hidden', marginBottom: '16px',
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                              {['Réf', 'Nom', 'Fournisseur', 'Qté', 'Prix unit.', 'Total', 'Ajouté par', 'Date'].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.production.components.map((c: any, i: number) => (
                              <tr key={i} style={{
                                borderBottom: i < data.production.components.length - 1 ? '1px solid var(--card-border)' : 'none',
                              }}>
                                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '12px' }}>{c.productSku}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--foreground)' }}>{c.productName}</td>
                                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{c.supplier}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--foreground)' }}>{c.quantity}</td>
                                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{c.unitPrice > 0 ? `${c.unitPrice.toFixed(2)} €` : '—'}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 600, color: c.totalPrice > 0 ? '#1d4ed8' : 'var(--muted)' }}>
                                  {c.totalPrice > 0 ? `${c.totalPrice.toFixed(2)} €` : '—'}
                                </td>
                                <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{c.addedBy || '—'}</td>
                                <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>
                                  {c.addedAt ? new Date(c.addedAt).toLocaleDateString('fr-FR') : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total composants */}
                      <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                      }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Coût total des composants</p>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>
                            {data.stats.totalComponentsCost.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── DEVIS ── */}
              {activeTab === 'invoices' && (
                <div>
                  {data.invoices.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '32px', color: 'var(--muted)',
                      background: 'var(--card-bg)', borderRadius: '12px',
                      border: '1px solid var(--card-border)',
                    }}>
                      <p style={{ fontSize: '14px', marginBottom: '4px' }}>Aucune facture liée à cette production.</p>
                      <p style={{ fontSize: '12px' }}>Créez un devis depuis la page Factures et sélectionnez cette production.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.invoices.map((inv: any) => {
                        const ist = invoiceStatusStyles[inv.status]
                        return (
                          <div key={inv._id} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '14px 16px', borderRadius: '10px',
                            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                          }}>
                            <FileText size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'monospace' }}>
                                {inv.invoiceNumber}
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                {inv.customerName} — {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                {inv.dueDate && ` — Échéance : ${new Date(inv.dueDate).toLocaleDateString('fr-FR')}`}
                              </p>
                            </div>
                            <span style={{
                              fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                              borderRadius: '20px', background: ist.bg, color: ist.color,
                              flexShrink: 0,
                            }}>
                              {ist.label}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>
                              {(inv.amount + inv.taxAmount).toFixed(2)} €
                            </span>
                          </div>
                        )
                      })}

                      {/* Total facturé */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        marginTop: '4px',
                      }}>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          Encaissé : <strong style={{ color: '#16a34a' }}>{data.stats.totalPaid.toFixed(2)} €</strong>
                        </span>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>CA HT (devis)</p>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#1d4ed8' }}>
                            {data.stats.totalInvoiced.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── MOUVEMENTS ── */}
              {activeTab === 'movements' && (
                <div>
                  {data.movements.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucun mouvement lié à cette production.</p>
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
                              {m.reason || (m.movementType === 'IN' ? 'Retour en stock' : 'Prélevé pour production')}
                            </p>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}