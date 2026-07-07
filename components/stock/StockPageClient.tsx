'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StockTable } from './StockTable'
import { StockFormModal } from './StockFormModal'
import { MovementModal } from './MovementModal'
import { HistoryModal } from './HistoryModal'
import { ProductIdentityModal } from './ProductIdentityModal'
import { ReorderReportButton } from './ReorderReportButton'
import { useDomainTheme } from '../providers/DomainThemeProvider'

export interface StockItem {
  _id: string
  sku: string
  name: string
  description?: string
  price: number
  status: string
  totalQuantity: number
  minimumStock: number
  etat: 'OK' | 'BAS' | 'RUPTURE'
  categoryId?: { _id: string; name: string }
  supplierId?: { _id: string; name: string }
}

export function StockPageClient() {
  const { vocab, icons } = useDomainTheme()
  const router = useRouter()
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterEtat, setFilterEtat] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<StockItem | null>(null)
  const [movementItem, setMovementItem] = useState<{ item: StockItem; type: 'IN' | 'OUT' } | null>(null)
  const [historyItem, setHistoryItem] = useState<StockItem | null>(null)
  const [identityItem, setIdentityItem] = useState<StockItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        search,
        ...(filterCategory && { categoryId: filterCategory }),
        ...(filterEtat && { etat: filterEtat }),
      })
      const r = await fetch(`/api/stocks?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [search, filterCategory, filterEtat])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => { load() }, [load])

  function handleEdit(item: StockItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditItem(null)
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch(`/api/stocks/${id}`, { method: 'DELETE' })
    load()
  }

  function handleOrder(item: StockItem) {
    router.push(
      `/purchase-orders?prefill=${item._id}&name=${encodeURIComponent(item.name)}&sku=${item.sku}&qty=${Math.max(item.minimumStock - item.totalQuantity, 1)}&price=${item.price}`
    )
  }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
            <h1>{icons.product} {vocab.stock}</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} {items.length > 1 ? vocab.products.toLowerCase() : vocab.product.toLowerCase()}
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: 'var(--domain-primary)', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          + Ajouter {vocab.product.toLowerCase()}
        </button>
      </div>

      {/* Filtres */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou SKU…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: '10px', border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', color: 'var(--foreground)',
              fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{
            padding: '9px 12px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: filterCategory ? 'var(--foreground)' : 'var(--muted)',
            fontSize: '14px', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterEtat}
          onChange={e => setFilterEtat(e.target.value)}
          style={{
            padding: '9px 12px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: filterEtat ? 'var(--foreground)' : 'var(--muted)',
            fontSize: '14px', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Tous les états</option>
          <option value="OK">✅ OK</option>
          <option value="BAS">⚠️ Stock bas</option>
          <option value="RUPTURE">🔴 Rupture</option>
        </select>

        {(filterCategory || filterEtat || search) && (
          <button
            onClick={() => { setSearch(''); setFilterCategory(''); setFilterEtat('') }}
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

        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', color: 'var(--muted)', cursor: 'pointer',
          }}
          aria-label="Rafraîchir"
        >
          <RefreshCw size={15} />
        </button>
        <ReorderReportButton />
      </div>

      {/* Tableau */}
      <StockTable
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMovement={(item, type) => setMovementItem({ item, type })}
        onHistory={(item) => setHistoryItem(item)}
        onIdentity={(item) => setIdentityItem(item)}
        onOrder={handleOrder}
      />

      {formOpen && (
        <StockFormModal
          item={editItem}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load() }}
        />
      )}

      {movementItem && (
        <MovementModal
          item={movementItem.item}
          type={movementItem.type}
          onClose={() => setMovementItem(null)}
          onSaved={() => { setMovementItem(null); load() }}
        />
      )}

      {historyItem && (
        <HistoryModal
          item={historyItem}
          onClose={() => setHistoryItem(null)}
        />
      )}

      {identityItem && (
        <ProductIdentityModal
          item={identityItem}
          onClose={() => setIdentityItem(null)}
        />
      )}
    </div>
  )
}