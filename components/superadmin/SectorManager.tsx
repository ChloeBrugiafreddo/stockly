'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

interface Props { dark: boolean }

const EMOJIS = ['📦', '🔧', '🚗', '🧵', '👗', '🍳', '👨‍🍳', '🏗️', '⚙️', '💊', '📐', '🌿', '🔬', '✈️', '🚢', '🏠', '💻', '🎨', '📚', '🎵', '⚽', '🔑', '🛒', '🧪', '🏋️']

export function SectorManager({ dark }: Props) {
    const [editingSector, setEditingSector] = useState<any>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [editSaving, setEditSaving] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', description: '',
    primary: '#3b82f6',
    primaryLight: '#eff6ff',
    primaryDark: '#1d4ed8',
    accent: '#f59e0b',
    vocabProduct: 'Produit',
    vocabProducts: 'Produits',
    vocabProduction: 'Production',
    vocabProductions: 'Productions',
    vocabStock: 'Stock',
    iconProduct: '📦',
    iconProduction: '🏭',
    categories: '',
  })

  const c = {
    bg:     dark ? '#0a0f1e' : '#f4f6fb',
    card:   dark ? '#131d35' : '#ffffff',
    card2:  dark ? '#0f1629' : '#f9fafb',
    border: dark ? '#1e2d4a' : '#dde3f0',
    text:   dark ? '#f0f4ff' : '#0d1117',
    muted:  dark ? '#7b8db0' : '#6b7280',
    input:  dark ? '#0a0f1e' : '#f9fafb',
    label:  dark ? '#94a3b8' : '#374151',
  }

  async function load() {
    setLoading(true)
    const r = await fetch('/api/superadmin/sectors')
    const j = await r.json()
    setSectors(j.sectors || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const r = await fetch('/api/superadmin/sectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, description: form.description,
        theme: {
          primary: form.primary, primaryLight: form.primaryLight,
          primaryDark: form.primaryDark, secondary: form.primary,
          accent: form.accent, accentLight: '#fffbeb',
        },
        vocab: {
          product: form.vocabProduct, products: form.vocabProducts,
          production: form.vocabProduction, productions: form.vocabProductions,
          stock: form.vocabStock,
        },
        icons: { product: form.iconProduct, production: form.iconProduction, supplier: '🏭', customer: '👤' },
        defaultCategories: form.categories.split(',').map(c => c.trim()).filter(Boolean),
      }),
    })
    const j = await r.json()
    setSaving(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    setFormOpen(false)
    load()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditSaving(true)
    await fetch(`/api/superadmin/sectors/${editingSector._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        theme: {
            primary: editForm.primary,
            primaryLight: editForm.primaryLight,
            primaryDark: editForm.primaryDark,
            secondary: editForm.primary,
            accent: editForm.accent,
            accentLight: '#fffbeb',
        },
        vocab: {
            product: editForm.vocabProduct,
            products: editForm.vocabProducts,
            production: editForm.vocabProduction,
            productions: editForm.vocabProductions,
            stock: editForm.vocabStock,
        },
        icons: {
            product: editForm.iconProduct,
            production: editForm.iconProduction,
            supplier: '🏭',
            customer: '👤',
        },
        }),
    })
    setEditSaving(false)
    setEditingSector(null)
    load()
    }

    function openEdit(sector: any) {
    setEditingSector(sector)
    setEditForm({
        name: sector.name,
        description: sector.description || '',
        primary: sector.theme?.primary || '#3b82f6',
        primaryLight: sector.theme?.primaryLight || '#eff6ff',
        primaryDark: sector.theme?.primaryDark || '#1d4ed8',
        accent: sector.theme?.accent || '#f59e0b',
        vocabProduct: sector.vocab?.product || 'Produit',
        vocabProducts: sector.vocab?.products || 'Produits',
        vocabProduction: sector.vocab?.production || 'Production',
        vocabProductions: sector.vocab?.productions || 'Productions',
        vocabStock: sector.vocab?.stock || 'Stock',
        iconProduct: sector.icons?.product || '📦',
        iconProduction: sector.icons?.production || '🏭',
    })
    }

  async function handleDelete(id: string, isSystem: boolean) {
    if (isSystem) { alert('Impossible de supprimer un secteur système'); return }
    if (!confirm('Supprimer ce secteur ?')) return
    await fetch(`/api/superadmin/sectors/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${c.border}`, background: c.input,
    color: c.text, fontSize: '13px', outline: 'none',
  }

  const lbl = { display: 'block', fontSize: '12px', fontWeight: 600 as const, color: c.label, marginBottom: '5px' }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: c.text, letterSpacing: '-0.5px' }}>
          Secteurs métiers <span style={{ fontSize: '16px', color: c.muted, fontWeight: 500 }}>({sectors.length})</span>
        </h2>
        <button onClick={() => setFormOpen(!formOpen)} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '10px 20px', borderRadius: '10px',
          background: '#1d4ed8', color: 'white',
          border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(29,78,216,0.25)',
        }}>
          <Plus size={15} />
          Nouveau secteur
        </button>
      </div>

      {/* Formulaire */}
      {formOpen && (
        <form onSubmit={handleCreate} style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: '16px', padding: '28px', marginBottom: '28px',
          boxShadow: dark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, color: c.text, marginBottom: '24px', letterSpacing: '-0.3px' }}>
            ✨ Créer un nouveau secteur
          </p>

          {/* Nom + description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Nom du secteur *</label>
              <input style={inp} required value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="ex: Bâtiment, Santé, Informatique..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Description</label>
              <input style={inp} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Description courte" />
            </div>
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: `1px solid ${c.border}`, margin: '0 0 20px' }} />

          {/* Couleurs */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Thème couleurs
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { key: 'primary', label: 'Couleur principale' },
              { key: 'primaryDark', label: 'Variante foncée' },
              { key: 'primaryLight', label: 'Variante claire' },
              { key: 'accent', label: 'Accent' },
            ].map(col => (
              <div key={col.key}>
                <label style={lbl}>{col.label}</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="color"
                    value={form[col.key as keyof typeof form]}
                    onChange={e => set(col.key, e.target.value)}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: `1px solid ${c.border}`, cursor: 'pointer', padding: '2px' }}
                  />
                  <input style={{ ...inp, flex: 1, fontSize: '12px' }}
                    value={form[col.key as keyof typeof form]}
                    onChange={e => set(col.key, e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          {/* Aperçu live */}
          <div style={{
            padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
            background: form.primaryLight,
            border: `2px solid ${form.primary}`,
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <span style={{ fontSize: '28px' }}>{form.iconProduct}</span>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: form.primary, marginBottom: '2px' }}>
                {form.name || 'Nom du secteur'}
              </p>
              <p style={{ fontSize: '12px', color: form.primaryDark, opacity: 0.8 }}>
                {form.vocabProducts} · {form.vocabProductions}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: form.primary }} />
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: `1px solid ${c.border}`, margin: '0 0 20px' }} />

          {/* Vocabulaire */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Vocabulaire
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { key: 'vocabProduct', label: 'Produit (singulier)', placeholder: 'ex: Pièce, Matériau' },
              { key: 'vocabProducts', label: 'Produits (pluriel)', placeholder: 'ex: Pièces, Matériaux' },
              { key: 'vocabProduction', label: 'Production (singulier)', placeholder: 'ex: Chantier, Projet' },
              { key: 'vocabProductions', label: 'Productions (pluriel)', placeholder: 'ex: Chantiers, Projets' },
              { key: 'vocabStock', label: 'Nom du stock', placeholder: 'ex: Inventaire matériaux' },
            ].map(v => (
              <div key={v.key}>
                <label style={lbl}>{v.label}</label>
                <input style={inp} value={form[v.key as keyof typeof form]}
                  onChange={e => set(v.key, e.target.value)}
                  placeholder={v.placeholder} />
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: `1px solid ${c.border}`, margin: '0 0 20px' }} />

          {/* Icônes */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Icônes
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'iconProduct', label: `Icône ${form.vocabProduct || 'produit'}` },
              { key: 'iconProduction', label: `Icône ${form.vocabProduction || 'production'}` },
            ].map(ic => (
              <div key={ic.key}>
                <label style={lbl}>{ic.label}</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {EMOJIS.map(emoji => (
                    <button key={emoji} type="button" onClick={() => set(ic.key, emoji)}
                      style={{
                        width: '38px', height: '38px', borderRadius: '8px', fontSize: '20px',
                        border: form[ic.key as keyof typeof form] === emoji
                          ? `2px solid ${form.primary}` : `1px solid ${c.border}`,
                        background: form[ic.key as keyof typeof form] === emoji
                          ? form.primaryLight : c.input,
                        cursor: 'pointer', transition: 'all 0.1s',
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ borderTop: `1px solid ${c.border}`, margin: '0 0 20px' }} />

          {/* Catégories */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Catégories par défaut
          </p>
          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Séparées par des virgules</label>
            <input style={inp} value={form.categories}
              onChange={e => set('categories', e.target.value)}
              placeholder="ex: Fondations, Charpente, Toiture, Plomberie, Électricité" />
            <p style={{ fontSize: '12px', color: c.muted, marginTop: '5px' }}>
              Disponibles pour toutes les entreprises de ce secteur
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setFormOpen(false)} style={{
              padding: '10px 20px', borderRadius: '9px',
              border: `1.5px solid ${c.border}`, background: 'transparent',
              color: c.muted, fontSize: '14px', cursor: 'pointer', fontWeight: 500,
            }}>Annuler</button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', borderRadius: '9px',
              background: '#1d4ed8', color: 'white',
              border: 'none', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', opacity: saving ? 0.6 : 1,
              boxShadow: '0 2px 10px rgba(29,78,216,0.25)',
            }}>
              {saving ? 'Création…' : '✓ Créer le secteur'}
            </button>
          </div>
        </form>
      )}

      {editingSector && (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }}
            onClick={() => setEditingSector(null)}
        >
            <div style={{
            background: c.card, borderRadius: '16px',
            border: `1px solid ${c.border}`,
            width: '100%', maxWidth: '680px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
            >
            <p style={{ fontSize: '16px', fontWeight: 800, color: c.text, marginBottom: '24px' }}>
                ✏️ Modifier — {editingSector.name}
            </p>

            <form onSubmit={handleEdit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Nom *</label>
                    <input style={inp} required value={editForm.name}
                    onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Description</label>
                    <input style={inp} value={editForm.description}
                    onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} />
                </div>
                </div>

                {/* Couleurs */}
                <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Couleurs</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { key: 'primary', label: 'Principale' },
                    { key: 'primaryDark', label: 'Foncée' },
                    { key: 'primaryLight', label: 'Claire' },
                    { key: 'accent', label: 'Accent' },
                ].map(col => (
                    <div key={col.key}>
                    <label style={lbl}>{col.label}</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color"
                        value={editForm[col.key]}
                        onChange={e => setEditForm((f: any) => ({ ...f, [col.key]: e.target.value }))}
                        style={{ width: '38px', height: '38px', borderRadius: '8px', border: `1px solid ${c.border}`, cursor: 'pointer', padding: '2px' }}
                        />
                        <input style={{ ...inp, flex: 1, fontSize: '12px' }}
                        value={editForm[col.key]}
                        onChange={e => setEditForm((f: any) => ({ ...f, [col.key]: e.target.value }))} />
                    </div>
                    </div>
                ))}
                </div>

                {/* Aperçu */}
                <div style={{
                padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
                background: editForm.primaryLight,
                border: `2px solid ${editForm.primary}`,
                display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                <span style={{ fontSize: '24px' }}>{editForm.iconProduct}</span>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: editForm.primary }}>{editForm.name}</p>
                    <p style={{ fontSize: '11px', color: editForm.primaryDark, opacity: 0.8 }}>
                    {editForm.vocabProducts} · {editForm.vocabProductions}
                    </p>
                </div>
                </div>

                {/* Vocabulaire */}
                <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Vocabulaire</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { key: 'vocabProduct', label: 'Produit (sing.)' },
                    { key: 'vocabProducts', label: 'Produits (plur.)' },
                    { key: 'vocabProduction', label: 'Production (sing.)' },
                    { key: 'vocabProductions', label: 'Productions (plur.)' },
                    { key: 'vocabStock', label: 'Nom du stock' },
                ].map(v => (
                    <div key={v.key}>
                    <label style={lbl}>{v.label}</label>
                    <input style={inp} value={editForm[v.key]}
                        onChange={e => setEditForm((f: any) => ({ ...f, [v.key]: e.target.value }))} />
                    </div>
                ))}
                </div>

                {/* Icônes */}
                <p style={{ fontSize: '12px', fontWeight: 700, color: c.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Icônes</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                    { key: 'iconProduct', label: 'Icône produit' },
                    { key: 'iconProduction', label: 'Icône production' },
                ].map(ic => (
                    <div key={ic.key}>
                    <label style={lbl}>{ic.label}</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {EMOJIS.map(emoji => (
                        <button key={emoji} type="button"
                            onClick={() => setEditForm((f: any) => ({ ...f, [ic.key]: emoji }))}
                            style={{
                            width: '36px', height: '36px', borderRadius: '8px', fontSize: '18px',
                            border: editForm[ic.key] === emoji ? `2px solid ${editForm.primary}` : `1px solid ${c.border}`,
                            background: editForm[ic.key] === emoji ? editForm.primaryLight : c.input,
                            cursor: 'pointer',
                            }}>
                            {emoji}
                        </button>
                        ))}
                    </div>
                    </div>
                ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingSector(null)} style={{
                    padding: '10px 20px', borderRadius: '9px',
                    border: `1.5px solid ${c.border}`, background: 'transparent',
                    color: c.muted, fontSize: '14px', cursor: 'pointer',
                }}>Annuler</button>
                <button type="submit" disabled={editSaving} style={{
                    padding: '10px 24px', borderRadius: '9px',
                    background: '#1d4ed8', color: 'white',
                    border: 'none', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', opacity: editSaving ? 0.6 : 1,
                }}>
                    {editSaving ? 'Sauvegarde…' : '✓ Sauvegarder'}
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

      {/* Liste */}
      {loading ? (
        <p style={{ color: c.muted }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sectors.map(sector => (
            <div key={sector._id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '20px 22px', borderRadius: '14px',
              background: c.card, border: `1px solid ${c.border}`,
              boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
            >
              {/* Icône avec couleur du secteur */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: sector.theme?.primaryLight || '#eff6ff',
                border: `2px solid ${sector.theme?.primary || '#3b82f6'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>
                {sector.icons?.product || '📦'}
              </div>

              {/* Infos */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: c.text }}>{sector.name}</p>
                  {sector.isSystem && (
                    <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                      Système
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: c.muted }}>
                  {sector.icons?.product} {sector.vocab?.products} · {sector.icons?.production} {sector.vocab?.productions}
                  {sector.defaultCategories?.length > 0 && (
                    <span style={{ marginLeft: '8px', color: c.muted }}>
                      · {sector.defaultCategories.length} catégories
                    </span>
                  )}
                </p>
              </div>

              {/* Bande couleur */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[sector.theme?.primary, sector.theme?.primaryDark, sector.theme?.accent].map((col, i) => (
                  col && <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: col, border: `1px solid ${c.border}` }} />
                ))}
              </div>

                <button onClick={() => openEdit(sector)} style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: `1.5px solid ${c.border}`,
                background: dark ? '#0f1629' : '#f8fafc',
                color: c.muted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                }}>
                <Pencil size={14} />
                </button>

              {/* Supprimer */}
              {!sector.isSystem && (
                
                <button onClick={() => handleDelete(sector._id, sector.isSystem)} style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: '1.5px solid #fecaca', background: '#fef2f2',
                  color: '#dc2626', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}