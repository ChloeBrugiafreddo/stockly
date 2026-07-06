'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'

interface Field {
  key: string
  label: string
  type?: 'text' | 'email' | 'tel'
  required?: boolean
  placeholder?: string
}

interface EntityPageProps {
  title: string
  apiPath: string
  fields: Field[]
  columns: { key: string; label: string }[]
  onRowClick?: (item: any) => void
}

export function EntityPage({ title, apiPath, fields, columns, onRowClick }: EntityPageProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ search })
      const r = await fetch(`${apiPath}?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [search, apiPath])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditItem(null)
    setForm({})
    setError('')
    setFormOpen(true)
  }

  function openEdit(item: any, e: React.MouseEvent) {
    e.stopPropagation() // empêche le onRowClick de se déclencher
    setEditItem(item)
    setForm({ ...item })
    setError('')
    setFormOpen(true)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation() // empêche le onRowClick de se déclencher
    if (!confirm('Supprimer cet élément ?')) return
    await fetch(`${apiPath}/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const url = editItem ? `${apiPath}/${editItem._id}` : apiPath
    const method = editItem ? 'PUT' : 'POST'

    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const j = await r.json()
    setSaving(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    setFormOpen(false)
    load()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: 500 as const, color: 'var(--muted)', marginBottom: '6px',
  }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            {title}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} élément{items.length > 1 ? 's' : ''}
            {onRowClick && (
              <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                — Cliquez sur une ligne pour voir l'historique
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: '#3b82f6', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Recherche */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Rechercher…`}
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: '10px', border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', color: 'var(--foreground)',
              fontSize: '14px', outline: 'none',
            }}
          />
        </div>
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
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>Chargement…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            Aucun élément — ajoutez le premier.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {columns.map(col => (
                    <th key={col.key} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
                    }}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item._id}
                    onClick={() => onRowClick?.(item)}
                    style={{
                      borderBottom: i < items.length - 1 ? '1px solid var(--card-border)' : 'none',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--card-bg)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    {columns.map(col => (
                      <td key={col.key} style={{ padding: '12px 16px', color: 'var(--foreground)' }}>
                        {item[col.key] || '—'}
                      </td>
                    ))}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={e => openEdit(item, e)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid var(--card-border)', background: 'transparent',
                            color: 'var(--muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={e => handleDelete(item._id, e)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid #fecaca', background: 'transparent',
                            color: '#dc2626', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal formulaire */}
      {formOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setFormOpen(false)}
        >
          <div
            style={{
              background: 'var(--background)', borderRadius: '16px',
              border: '1px solid var(--card-border)',
              width: '100%', maxWidth: '480px', padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '20px' }}>
              {editItem ? 'Modifier' : 'Ajouter'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {fields.map(field => (
                  <div key={field.key}>
                    <label style={labelStyle}>
                      {field.label} {field.required && '*'}
                    </label>
                    <input
                      style={inputStyle}
                      type={field.type || 'text'}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={form[field.key] || ''}
                      onChange={e => setForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid var(--card-border)',
                    background: 'transparent', color: 'var(--foreground)',
                    fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    background: '#3b82f6', color: 'white', border: 'none',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Enregistrement…' : editItem ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}