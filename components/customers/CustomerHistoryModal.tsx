'use client'

import { useEffect, useState } from 'react'
import { X, FileText, Factory } from 'lucide-react'

interface Props {
  customer: any
  onClose: () => void
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyé' },
  PAID:      { bg: '#f0fdf4', color: '#16a34a', label: '✅ Accepté' },
  OVERDUE:   { bg: '#fffbeb', color: '#d97706', label: '⚠️ Expiré' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulé' },
}

const prodStatusStyles: Record<string, { bg: string; color: string; label: string }> = {
  EN_COURS: { bg: '#eff6ff', color: '#1d4ed8', label: '🔧 En cours' },
  TERMINE:  { bg: '#f0fdf4', color: '#16a34a', label: '✅ Terminé' },
  ARCHIVE:  { bg: '#f1f5f9', color: '#64748b', label: '📦 Archivé' },
}

export function CustomerHistoryModal({ customer, onClose }: Props) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [productions, setProductions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'invoices' | 'productions'>('invoices')

  useEffect(() => {
    Promise.all([
      fetch(`/api/customers/${customer._id}/history`).then(r => r.json()),
      fetch(`/api/productions?customerId=${customer._id}`).then(r => r.json()),
    ]).then(([histData, prodData]) => {
      setInvoices(histData.invoices || [])
      setProductions(prodData.items || [])
    }).finally(() => setLoading(false))
  }, [customer._id])

  // TVA calculée à l'affichage
  const totalHT = invoices.reduce((sum, i) => sum + i.amount, 0)
  const totalTTC = totalHT * 1.20
  const totalPaid = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount * 1.20, 0)

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
          width: '100%', maxWidth: '680px',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'var(--domain-primary-light, #eff6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 800,
              color: 'var(--domain-primary, #3b82f6)',
            }}>
              {customer.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '3px' }}>
                {customer.name}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {customer.email && customer.email}
                {customer.phone && ` · ${customer.phone}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Devis', value: invoices.length.toString(), color: '#3b82f6' },
                { label: 'Total TTC', value: `${totalTTC.toFixed(2)} €`, color: '#7c3aed' },
                { label: 'Encaissé TTC', value: `${totalPaid.toFixed(2)} €`, color: '#16a34a' },
                { label: 'Productions', value: productions.length.toString(), color: '#d97706' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: '10px', padding: '12px 14px',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglets */}
        <div style={{ padding: '16px 28px 0', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'invoices', label: `📄 Devis (${invoices.length})` },
              { id: 'productions', label: `🏭 Productions (${productions.length})` },
            ].map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px 8px 0 0',
                    border: 'none', cursor: 'pointer',
                    background: active ? 'var(--background)' : 'transparent',
                    color: active ? 'var(--foreground)' : 'var(--muted)',
                    fontSize: '13px', fontWeight: active ? 700 : 400,
                    borderBottom: active ? '2px solid var(--domain-primary, #3b82f6)' : '2px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 28px' }}>
          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement…</p>
          ) : tab === 'invoices' ? (
            invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                <FileText size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>Aucun devis pour ce client</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {invoices.map(inv => {
                  const st = statusStyles[inv.status]
                  const ttc = inv.amount * 1.20
                  return (
                    <div key={inv._id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'monospace', marginBottom: '2px' }}>
                          {inv.invoiceNumber}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                          {inv.dueDate && ` · Échéance : ${new Date(inv.dueDate).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 10px',
                        borderRadius: '20px', background: st.bg, color: st.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {st.label}
                      </span>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>
                          {ttc.toFixed(2)} € TTC
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {inv.amount.toFixed(2)} € HT
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            productions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                <Factory size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>Aucune production liée à ce client</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {productions.map(prod => {
                  const st = prodStatusStyles[prod.status] || prodStatusStyles['EN_COURS']
                  return (
                    <div key={prod._id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>
                          {prod.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                          {prod.ref} · {new Date(prod.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 10px',
                        borderRadius: '20px', background: st.bg, color: st.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {st.label}
                      </span>
                      {prod.components?.length > 0 && (
                        <p style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          {prod.components.length} composant{prod.components.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}