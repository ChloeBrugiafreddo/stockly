'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, Pencil, Trash2, Mail, Phone, MapPin, ChevronDown, ChevronRight, User, History } from 'lucide-react'
import { CustomerHistoryModal } from './CustomerHistoryModal'

interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
}

export function CustomersClient() {
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Customer | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [collapsedLetters, setCollapsedLetters] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ search })
      const r = await fetch(`/api/customers?${qs}`)
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

  function openEdit(item: Customer, e: React.MouseEvent) {
    e.stopPropagation()
    setEditItem(item)
    setForm({ ...item })
    setError('')
    setFormOpen(true)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Supprimer ce client ?')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const url = editItem ? `/api/customers/${editItem._id}` : '/api/customers'
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

  function toggleLetter(letter: string) {
    setCollapsedLetters(prev => {
      const next = new Set(prev)
      next.has(letter) ? next.delete(letter) : next.add(letter)
      return next
    })
  }

  // Groupe par première lettre
  const grouped = items.reduce((acc, item) => {
    const letter = item.name[0]?.toUpperCase() || '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(item)
    return acc
  }, {} as Record<string, Customer[]>)

  const sortedLetters = Object.keys(grouped).sort()

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
            👤 Clients
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {items.length} client{items.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px',
          background: 'var(--domain-primary, #3b82f6)', color: 'white', border: 'none',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>
          <Plus size={16} />
          Ajouter un client
        </button>
      </div>

      {/* Recherche */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
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

      {/* Liste groupée par lettre */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Chargement…</div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: 'var(--card-bg)', borderRadius: '16px',
          border: '2px dashed var(--card-border)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👤</div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            Aucun client
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Ajoutez votre premier client.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedLetters.map(letter => {
            const letterItems = grouped[letter]
            const isCollapsed = collapsedLetters.has(letter)

            return (
              <div key={letter} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px', overflow: 'hidden',
              }}>
                {/* Header lettre */}
                <div
                  onClick={() => toggleLetter(letter)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', cursor: 'pointer',
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
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'var(--domain-primary-light, #eff6ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 800,
                      color: 'var(--domain-primary, #3b82f6)',
                    }}>
                      {letter}
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                      background: 'var(--card-border)', padding: '2px 8px', borderRadius: '10px',
                    }}>
                      {letterItems.length} client{letterItems.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Cartes clients */}
                {!isCollapsed && (
                  <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {letterItems.map(customer => {
                      const isHovered = hoveredId === customer._id
                      return (
                        <div
                          key={customer._id}
                          onMouseEnter={() => setHoveredId(customer._id)}
                          onMouseLeave={() => setHoveredId(null)}
                          style={{
                            padding: '18px', borderRadius: '12px',
                            border: `1px solid ${isHovered ? 'var(--domain-primary, #3b82f6)' : 'var(--card-border)'}`,
                            background: isHovered ? 'var(--domain-primary-light, #eff6ff)' : 'var(--background)',
                            transition: 'all 0.15s', cursor: 'default',
                          }}
                        >
                          {/* Nom + actions */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'var(--domain-primary-light, #eff6ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: 800,
                                color: 'var(--domain-primary, #3b82f6)',
                                flexShrink: 0,
                              }}>
                                {customer.name[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '2px' }}>
                                  {customer.name}
                                </p>
                                {customer.address && (
                                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {customer.address}
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
                              <button
                                onClick={e => { e.stopPropagation(); setSelectedCustomer(customer) }}
                                title="Historique devis"
                                style={{
                                  width: '28px', height: '28px', borderRadius: '7px',
                                  border: '1px solid #e9d5ff', background: '#f5f3ff',
                                  color: '#7c3aed', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <History size={12} />
                              </button>
                              <button onClick={e => openEdit(customer, e)} title="Modifier" style={{
                                width: '28px', height: '28px', borderRadius: '7px',
                                border: '1px solid var(--card-border)', background: 'var(--card-bg)',
                                color: 'var(--muted)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Pencil size={12} />
                              </button>
                              <button onClick={e => handleDelete(customer._id, e)} title="Supprimer" style={{
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
                            {customer.email && (
                              <a
                                href={`mailto:${customer.email}`}
                                onClick={e => e.stopPropagation()}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  fontSize: '13px', color: 'var(--domain-primary, #3b82f6)',
                                  textDecoration: 'none', fontWeight: 500,
                                }}
                              >
                                <Mail size={13} />
                                {customer.email}
                              </a>
                            )}
                            {customer.phone && (
                              <a
                                href={`tel:${customer.phone}`}
                                onClick={e => e.stopPropagation()}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  fontSize: '13px', color: 'var(--domain-primary, #3b82f6)',
                                  textDecoration: 'none', fontWeight: 500,
                                }}
                              >
                                <Phone size={13} />
                                {customer.phone}
                              </a>
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
              width: '100%', maxWidth: '480px',
              maxHeight: '90vh', overflowY: 'auto', padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '24px' }}>
              {editItem ? '✏️ Modifier le client' : '👤 Nouveau client'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={lbl}>Nom *</label>
                  <input style={inp} required value={form.name || ''}
                    onChange={e => set('name', e.target.value)}
                    placeholder="ex: Jean Dupont" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input style={inp} type="email" value={form.email || ''}
                      onChange={e => set('email', e.target.value)}
                      placeholder="jean@exemple.com" />
                  </div>
                  <div>
                    <label style={lbl}>Téléphone</label>
                    <input style={inp} type="tel" value={form.phone || ''}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="06 00 00 00 00" />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Adresse</label>
                  <input style={inp} value={form.address || ''}
                    onChange={e => set('address', e.target.value)}
                    placeholder="1 rue de la Paix, Paris" />
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

      {/* Modal historique */}
      {selectedCustomer && (
        <CustomerHistoryModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}