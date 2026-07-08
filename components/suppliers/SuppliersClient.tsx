'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, Pencil, Trash2, Mail, Phone, MapPin, ChevronDown, ChevronRight, Building2 } from 'lucide-react'

interface Supplier {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  country?: string
  notes?: string
  createdAt: string
}

export function SuppliersClient() {
  const [items, setItems] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Supplier | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ search })
      const r = await fetch(`/api/suppliers?${qs}`)
      const j = await r.json()
      setItems(j.items || [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditItem(null)
    setForm({})
    setError('')
    setFormOpen(true)
  }

  function openEdit(item: Supplier, e: React.MouseEvent) {
    e.stopPropagation()
    setEditItem(item)
    setForm({ ...item })
    setError('')
    setFormOpen(true)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Supprimer ce fournisseur ?')) return
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const url = editItem ? `/api/suppliers/${editItem._id}` : '/api/suppliers'
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

  function set(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }))
  }

  function toggleCountry(country: string) {
    setCollapsedCountries(prev => {
      const next = new Set(prev)
      next.has(country) ? next.delete(country) : next.add(country)
      return next
    })
  }

  // Groupe par pays
  const grouped = items.reduce((acc, item) => {
    const country = item.country || 'Sans pays'
    if (!acc[country]) acc[country] = []
    acc[country].push(item)
    return acc
  }, {} as Record<string, Supplier[]>)

  const sortedCountries = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid var(--card-border)',
    background: 'var(--card-bg)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const lbl = {
    display: 'block', fontSize: '12px', fontWeight: 600 as const,
    color: 'var(--muted)', marginBottom: '5px',
  }

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            🚚 Fournisseurs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} fournisseur{items.length > 1 ? 's' : ''}
            {sortedCountries.length > 1 && ` · ${sortedCountries.length} pays`}
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px',
          background: 'var(--domain-primary, #3b82f6)', color: 'white', border: 'none',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>
          <Plus size={16} />
          Ajouter un fournisseur
        </button>
      </div>

      {/* Recherche */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un fournisseur…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: '10px', border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', color: 'var(--foreground)',
              fontSize: '14px', outline: 'none',
            }}
          />
        </div>
        <button onClick={load} style={{
          width: '38px', height: '38px', borderRadius: '10px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)', color: 'var(--muted)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Liste groupée par pays */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Chargement…</div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: 'var(--card-bg)', borderRadius: '16px',
          border: '2px dashed var(--card-border)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚚</div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            Aucun fournisseur
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Ajoutez votre premier fournisseur.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedCountries.map(country => {
            const countryItems = grouped[country]
            const isCollapsed = collapsedCountries.has(country)

            return (
              <div key={country} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px', overflow: 'hidden',
              }}>
                {/* Header pays */}
                <div
                  onClick={() => toggleCountry(country)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', cursor: 'pointer',
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)',
                    transition: 'background 0.15s', userSelect: 'none' as const,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--card-border)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isCollapsed
                      ? <ChevronRight size={16} color="var(--muted)" />
                      : <ChevronDown size={16} color="var(--muted)" />
                    }
                    <MapPin size={14} color="var(--muted)" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>
                      {country}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                      background: 'var(--card-border)', padding: '2px 8px', borderRadius: '10px',
                    }}>
                      {countryItems.length} fournisseur{countryItems.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Cartes fournisseurs */}
                {!isCollapsed && (
                  <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {countryItems.map(supplier => {
                      const isHovered = hoveredId === supplier._id
                      return (
                        <div
                          key={supplier._id}
                          onMouseEnter={() => setHoveredId(supplier._id)}
                          onMouseLeave={() => setHoveredId(null)}
                          style={{
                            padding: '18px', borderRadius: '12px',
                            border: `1px solid ${isHovered ? 'var(--domain-primary, #3b82f6)' : 'var(--card-border)'}`,
                            background: isHovered ? 'var(--domain-primary-light, #eff6ff)' : 'var(--background)',
                            transition: 'all 0.15s', position: 'relative' as const,
                          }}
                        >
                          {/* Nom */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'var(--domain-primary-light, #eff6ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Building2 size={16} color="var(--domain-primary, #3b82f6)" />
                              </div>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '2px' }}>
                                  {supplier.name}
                                </p>
                                {supplier.address && (
                                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {supplier.address}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{
                              display: 'flex', gap: '4px',
                              opacity: isHovered ? 1 : 0,
                              transition: 'opacity 0.15s',
                            }}>
                              <button onClick={e => openEdit(supplier, e)} title="Modifier" style={{
                                width: '28px', height: '28px', borderRadius: '7px',
                                border: '1px solid var(--card-border)', background: 'var(--card-bg)',
                                color: 'var(--muted)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Pencil size={12} />
                              </button>
                              <button onClick={e => handleDelete(supplier._id, e)} title="Supprimer" style={{
                                width: '28px', height: '28px', borderRadius: '7px',
                                border: '1px solid #fecaca', background: '#fef2f2',
                                color: '#dc2626', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Contacts cliquables */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {supplier.email && (
                                <a
                                href={`mailto:${supplier.email}`}
                                onClick={e => e.stopPropagation()}
                                style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '13px', color: 'var(--domain-primary, #3b82f6)',
                                textDecoration: 'none', fontWeight: 500,
                                }}
                            >
                                <Mail size={13} />
                                {supplier.email}
                            </a>
                            )}
                           {supplier.phone && (
                            <a
                                href={`tel:${supplier.phone}`}
                                onClick={e => e.stopPropagation()}
                                style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '13px', color: 'var(--domain-primary, #3b82f6)',
                                textDecoration: 'none', fontWeight: 500,
                                }}
                            >
                                <Phone size={13} />
                                {supplier.phone}
                            </a>
                            )}
                            {supplier.notes && (
                              <p style={{
                                fontSize: '12px', color: 'var(--muted)',
                                marginTop: '4px', paddingTop: '8px',
                                borderTop: '1px solid var(--card-border)',
                                lineHeight: 1.5,
                              }}>
                                {supplier.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal formulaire */}
      {formOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={() => setFormOpen(false)}
        >
          <div
            style={{
              background: 'var(--background)', borderRadius: '16px',
              border: '1px solid var(--card-border)',
              width: '100%', maxWidth: '500px',
              maxHeight: '90vh', overflowY: 'auto', padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '24px' }}>
              {editItem ? '✏️ Modifier le fournisseur' : '🚚 Nouveau fournisseur'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={lbl}>Nom *</label>
                  <input style={inp} required value={form.name || ''}
                    onChange={e => set('name', e.target.value)}
                    placeholder="ex: PiecesAuto Pro" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input style={inp} type="email" value={form.email || ''}
                      onChange={e => set('email', e.target.value)}
                      placeholder="contact@fournisseur.fr" />
                  </div>
                  <div>
                    <label style={lbl}>Téléphone</label>
                    <input style={inp} type="tel" value={form.phone || ''}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="01 23 45 67 89" />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Adresse</label>
                  <input style={inp} value={form.address || ''}
                    onChange={e => set('address', e.target.value)}
                    placeholder="12 rue de la Mécanique, 75011 Paris" />
                </div>
                <div>
                  <label style={lbl}>Pays</label>
                  <input style={inp} value={form.country || ''}
                    onChange={e => set('country', e.target.value)}
                    placeholder="France" />
                </div>
                <div>
                  <label style={lbl}>Notes</label>
                  <textarea
                    style={{ ...inp, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                    value={form.notes || ''}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Spécialités, délais de livraison, conditions particulières..." />
                </div>
              </div>

              {error && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFormOpen(false)} style={{
                  padding: '10px 20px', borderRadius: '10px',
                  border: '1px solid var(--card-border)',
                  background: 'transparent', color: 'var(--foreground)',
                  fontSize: '14px', cursor: 'pointer',
                }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', borderRadius: '10px',
                  background: 'var(--domain-primary, #3b82f6)', color: 'white', border: 'none',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}>
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