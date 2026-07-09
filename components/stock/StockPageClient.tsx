'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StockTable } from './StockTable'
import { StockFormModal } from './StockFormModal'
import { MovementModal } from './MovementModal'
import { HistoryModal } from './HistoryModal'
import { ProductIdentityModal } from './ProductIdentityModal'
import { ReorderReportButton } from './ReorderReportButton'
import { useDomainTheme } from '../providers/DomainThemeProvider'
import { exportToExcel } from '@/lib/exportExcel'

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
  supplierId?: { _id: string; name: string }  // ← vérifie que c'est là
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

  async function handleExportExcel() {
      const r = await fetch('/api/reports/stock')
      const data = await r.json()

      await exportToExcel([
        {
          name: 'Stock',
          headers: ['État', 'SKU', 'Produit', 'Catégorie', 'Fournisseur', 'Quantité', 'Seuil mini', 'Prix HT (€)', 'Valeur HT (€)'],
          rows: (data.rows || []).map((r: any) => [
            r.etat,
            r.sku,
            r.name,
            r.category,
            r.supplier,
            r.quantity,
            r.minimumStock,
            r.unitPrice > 0 ? r.unitPrice.toFixed(2) : '—',
            r.totalValue > 0 ? r.totalValue.toFixed(2) : '—',
          ]),
          colors: { header: '1D4ED8', accent: 'EFF6FF' }, // bleu
        },
      ], `stock-${new Date().toISOString().slice(0, 10)}`)
    }

    async function handleExportPDF() {
        const r = await fetch('/api/reports/stock')
        const data = await r.json()

        const { jsPDF } = await import('jspdf')
        const { default: autoTable } = await import('jspdf-autotable')
        const doc = new jsPDF({ orientation: 'landscape' })
        const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

        doc.setFillColor(29, 78, 216)
        doc.rect(0, 0, 297, 28, 'F')
        doc.setFontSize(18); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold')
        doc.text('STOCKLY — Rapport Stock', 14, 12)
        doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(191,219,254)
        doc.text(`Généré le ${date}  |  ${data.summary?.totalProducts || 0} produits  |  Valeur : ${data.summary?.totalValue?.toFixed(2) || 0} € HT`, 14, 22)

        autoTable(doc, {
          startY: 36,
          head: [['État', 'SKU', 'Produit', 'Catégorie', 'Fournisseur', 'Stock', 'Seuil', 'Prix HT', 'Valeur HT']],
          body: (data.rows || []).map((r: any) => [
            r.etat, r.sku, r.name, r.category, r.supplier,
            r.quantity, r.minimumStock,
            r.unitPrice > 0 ? `${r.unitPrice.toFixed(2)} €` : '—',
            r.totalValue > 0 ? `${r.totalValue.toFixed(2)} €` : '—',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [29, 78, 216], fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          didParseCell: (d) => {
            if (d.column.index === 0 && d.section === 'body') {
              const v = d.cell.text[0]
              if (v === 'RUPTURE') { d.cell.styles.textColor = [220,38,38]; d.cell.styles.fontStyle = 'bold' }
              else if (v === 'BAS') { d.cell.styles.textColor = [217,119,6]; d.cell.styles.fontStyle = 'bold' }
              else { d.cell.styles.textColor = [22,163,74] }
            }
          },
          margin: { left: 14, right: 14 },
        })

        doc.save(`stock-${new Date().toISOString().slice(0,10)}.pdf`)
      }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
              {icons.product} {vocab.stock}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
              {items.length} {items.length > 1 ? vocab.products.toLowerCase() : vocab.product.toLowerCase()}
            </p>
          </div>
          <button onClick={handleAdd} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: 'var(--domain-primary, #3b82f6)', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            <Plus size={16} />
            Ajouter {vocab.product.toLowerCase()}
          </button>
        </div>
        {/* Boutons PDF/Excel sur ligne séparée sur mobile */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleExportPDF} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', color: 'var(--foreground)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>
            <FileDown size={14} /> PDF
          </button>
          <button onClick={handleExportExcel} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', color: 'var(--foreground)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>
            📊 Excel
          </button>
          <ReorderReportButton />
        </div>
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