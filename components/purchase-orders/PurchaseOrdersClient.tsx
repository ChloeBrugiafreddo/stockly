'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { PurchaseOrderTable } from './PurchaseOrderTable'
import { PurchaseOrderFormModal } from './PurchaseOrderFormModal'

export interface PurchaseOrderItem {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
}

export interface PurchaseOrder {
  _id: string
  supplierId: { _id: string; name: string; email?: string; phone?: string }
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED'
  items: PurchaseOrderItem[]
  totalPrice: number
  notes?: string
  expectedAt?: string
  receivedAt?: string
  createdAt: string
}

export function PurchaseOrdersClient() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [prefillProducts, setPrefillProducts] = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams(filterStatus ? { status: filterStatus } : {})
      const r = await fetch(`/api/purchase-orders?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  // Gestion du prefill depuis la page stock
  useEffect(() => {
    const prefillId    = searchParams.get('prefill')
    const prefillName  = searchParams.get('name')
    const prefillSku   = searchParams.get('sku')
    const prefillQty   = searchParams.get('qty')
    const prefillPrice = searchParams.get('price')

    if (prefillId && prefillName) {
      setPrefillProducts([{
        _id:          prefillId,
        name:         decodeURIComponent(prefillName),
        sku:          prefillSku || '',
        minimumStock: Number(prefillQty) || 1,
        totalQuantity: 0,
        price:        Number(prefillPrice) || 0,
      }])
      setFormOpen(true)
    }
  }, [searchParams])

  async function handleChangeStatus(id: string, status: string) {
    await fetch(`/api/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette commande ?')) return
    await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
    load()
  }

  const enAttente = items.filter(i => i.status === 'SENT').length
  const brouillons = items.filter(i => i.status === 'DRAFT').length

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            Commandes fournisseurs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} commande{items.length > 1 ? 's' : ''}
            {enAttente > 0 && ` — ${enAttente} en attente de livraison`}
          </p>
        </div>
        <button
          onClick={() => { setPrefillProducts([]); setFormOpen(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: '#3b82f6', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nouvelle commande
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Brouillons',  value: brouillons,                                             color: '#64748b' },
          { label: 'Envoyées',    value: enAttente,                                              color: '#1d4ed8' },
          { label: 'Reçues',      value: items.filter(i => i.status === 'RECEIVED').length,      color: '#16a34a' },
          { label: 'Annulées',    value: items.filter(i => i.status === 'CANCELLED').length,     color: '#dc2626' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
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
          <option value="SENT">📤 Envoyée</option>
          <option value="RECEIVED">✅ Reçue</option>
          <option value="CANCELLED">❌ Annulée</option>
        </select>

        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '10px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)', color: 'var(--muted)', cursor: 'pointer',
        }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <PurchaseOrderTable
        items={items}
        loading={loading}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
      />

      {formOpen && (
        <PurchaseOrderFormModal
          prefillProducts={prefillProducts}
          onClose={() => { setFormOpen(false); setPrefillProducts([]) }}
          onSaved={() => { setFormOpen(false); setPrefillProducts([]); load() }}
        />
      )}
    </div>
  )
}