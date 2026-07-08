'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { ProductionTable } from './ProductionTable'
import { ProductionFormModal } from './ProductionFormModal'
import { ProductionDetailModal } from './ProductionDetailModal'
import { ProductionIdentityModal } from './ProductionIdentityModal'
import { useDomainTheme } from '../providers/DomainThemeProvider'

export interface Component {
  _id: string
  productId: string
  ref: string
  name: string
  quantity: number
  addedAt: string
  addedBy: string
}

export interface Production {
  _id: string
  ref: string
  name: string
  description?: string
  status: 'EN_COURS' | 'TERMINE' | 'ARCHIVE'
  components: Component[]
  notes?: string
  createdAt: string
}

export function ProductionsClient() {
  const { vocab, icons } = useDomainTheme()
  const [items, setItems] = useState<Production[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Production | null>(null)
  const [identityItem, setIdentityItem] = useState<Production | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        search,
        ...(filterStatus && { status: filterStatus }),
      })
      const r = await fetch(`/api/productions?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette production ?')) return
    await fetch(`/api/productions/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleChangeStatus(id: string, status: string) {
    await fetch(`/api/productions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1>{icons.production} {vocab.productions}</h1>
          <p>{items.length} {vocab.production.toLowerCase()}{items.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background:  'var(--domain-primary)', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
         Nouvelle {vocab.production.toLowerCase()}
        </button>
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
            placeholder="Rechercher par nom ou référence…"
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
          <option value="EN_COURS">🔵 En cours</option>
          <option value="TERMINE">✅ Terminé</option>
          <option value="ARCHIVE">📦 Archivé</option>
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

        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tableau */}
      <ProductionTable
        items={items}
        loading={loading}
        onDetail={item => setDetailItem(item)}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
        onIdentity={item => setIdentityItem(item)}
      />

      {/* Modal création */}
      {formOpen && (
        <ProductionFormModal
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load() }}
        />
      )}

      {/* Modal détail */}
      {detailItem && (
        <ProductionDetailModal
          production={detailItem}
          onClose={() => { setDetailItem(null); load() }}
        />
      )}

      {/* Modal carte d'identité */}
      {identityItem && (
        <ProductionIdentityModal
          production={identityItem}
          onClose={() => setIdentityItem(null)}
        />
      )}
    </div>
  )
}