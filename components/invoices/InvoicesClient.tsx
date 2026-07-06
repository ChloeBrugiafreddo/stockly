'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { InvoiceTable } from './InvoiceTable'
import { InvoiceFormModal } from './InvoiceFormModal'
import { InvoiceDetailModal } from './InvoiceDetailModal'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  customerName: string
  customerEmail?: string
  items: InvoiceItem[]
  amount: number  // toujours HT
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate?: string
  paidAt?: string
  notes?: string
  createdAt: string
}

// Helper TVA — utilisé partout de façon cohérente
export const TVA_RATE = 0.20
export const toTTC = (ht: number) => ht * (1 + TVA_RATE)
export const tvaAmount = (ht: number) => ht * TVA_RATE

export function InvoicesClient() {
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Invoice | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        search,
        ...(filterStatus && { status: filterStatus }),
      })
      const r = await fetch(`/api/invoices?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus])

  useEffect(() => { load() }, [load])

  async function handleChangeStatus(id: string, status: string) {
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce devis ?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    load()
  }

  const totalHT = items.reduce((sum, i) => sum + i.amount, 0)
  const totalTTC = toTTC(totalHT)
  const enAttente = items.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length
  const acceptes = items.filter(i => i.status === 'PAID').length

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            Devis
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} devis
            {enAttente > 0 && ` — ${enAttente} en attente de réponse`}
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: '#3b82f6', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nouveau devis
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total HT', value: `${totalHT.toFixed(2)} €`, color: '#3b82f6' },
          { label: 'Total TTC', value: `${totalTTC.toFixed(2)} €`, color: '#7c3aed' },
          { label: 'En attente', value: enAttente.toString(), color: '#d97706' },
          { label: 'Acceptés', value: acceptes.toString(), color: '#16a34a' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par numéro…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: '10px', border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', color: 'var(--foreground)',
              fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '9px 12px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', color: 'var(--muted)',
            fontSize: '14px', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">📝 Brouillon</option>
          <option value="SENT">📤 Envoyé</option>
          <option value="PAID">✅ Accepté</option>
          <option value="OVERDUE">⚠️ Expiré</option>
          <option value="CANCELLED">❌ Annulé</option>
        </select>

        {(search || filterStatus) && (
          <button
            onClick={() => { setSearch(''); setFilterStatus('') }}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'transparent', color: 'var(--muted)',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            Réinitialiser
          </button>
        )}

        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '10px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)', color: 'var(--muted)', cursor: 'pointer',
        }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <InvoiceTable
        items={items}
        loading={loading}
        onDetail={item => setDetailItem(item)}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
      />

      {formOpen && (
        <InvoiceFormModal
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load() }}
        />
      )}

      {detailItem && (
        <InvoiceDetailModal
          invoice={detailItem}
          onClose={() => { setDetailItem(null); load() }}
          onChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  )
}