'use client'

import { useEffect, useState } from 'react'
import { X, FileText } from 'lucide-react'

interface Props {
  customer: any
  onClose: () => void
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyée' },
  PAID:      { bg: '#f0fdf4', color: '#16a34a', label: '✅ Payée' },
  OVERDUE:   { bg: '#fffbeb', color: '#d97706', label: '⚠️ En retard' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulée' },
}

export function CustomerHistoryModal({ customer, onClose }: Props) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/customers/${customer._id}/history`)
      .then(r => r.json())
      .then(d => {
        setInvoices(d.invoices || [])
      })
      .finally(() => setLoading(false))
  }, [customer._id])

  const totalTTC = invoices.reduce((sum, i) => sum + i.amount + i.taxAmount, 0)
  const totalPaid = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount + i.taxAmount, 0)

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
          width: '100%', maxWidth: '640px',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
              {customer.name}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {customer.email && `${customer.email}`}
              {customer.phone && ` — ${customer.phone}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px' }}>

          {/* Stats rapides */}
          {!loading && invoices.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Factures', value: invoices.length.toString(), color: '#3b82f6' },
                { label: 'Total TTC', value: `${totalTTC.toFixed(2)} €`, color: '#7c3aed' },
                { label: 'Encaissé', value: `${totalPaid.toFixed(2)} €`, color: '#16a34a' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: '10px', padding: '12px 16px',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Factures */}
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Factures ({invoices.length})
          </h3>

          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement…</p>
          ) : invoices.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucune facture pour ce client.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoices.map(inv => {
                const st = statusStyles[inv.status]
                return (
                  <div key={inv._id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'monospace' }}>
                        {inv.invoiceNumber}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                        {inv.dueDate && ` — Échéance : ${new Date(inv.dueDate).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                      borderRadius: '20px', background: st.bg, color: st.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                      {(inv.amount + inv.taxAmount).toFixed(2)} €
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}