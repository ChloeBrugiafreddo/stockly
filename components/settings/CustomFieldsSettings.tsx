'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'

const fieldTypes = [
  { value: 'text',    label: 'Texte' },
  { value: 'number',  label: 'Nombre' },
  { value: 'date',    label: 'Date' },
  { value: 'boolean', label: 'Oui / Non' },
  { value: 'select',  label: 'Liste de choix' },
]

const entityLabels: Record<string, string> = {
  product:  'Produit',
  order:    'Commande',
  customer: 'Client',
  supplier: 'Fournisseur',
}

const domainExamples: Record<string, { fieldName: string; fieldLabel: string }> = {
  'Automobile': {
    fieldName: 'ex: marque_compatible, reference_oem...',
    fieldLabel: 'ex: Marque compatible, Référence OEM...',
  },
  'Textile': {
    fieldName: 'ex: taille_vetement, composition...',
    fieldLabel: 'ex: Taille du vêtement, Composition...',
  },
  'Alimentaire': {
    fieldName: 'ex: date_limite, numero_lot...',
    fieldLabel: 'ex: Date limite, Numéro de lot...',
  },
  'default': {
    fieldName: 'ex: mon_champ_custom...',
    fieldLabel: 'ex: Mon champ personnalisé...',
  },
}

export function CustomFieldsSettings() {
  const { data: session } = useSession()
  const domain = (session?.user as any)?.domain || 'default'
  const examples = domainExamples[domain] || domainExamples['default']

  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    fieldName: '', fieldLabel: '', fieldType: 'text',
    entity: 'product', isRequired: false, options: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const r = await fetch('/api/settings/custom-fields')
    const j = await r.json()
    setFields(j.fields || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function set(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const r = await fetch('/api/settings/custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        options: form.fieldType === 'select'
          ? form.options.split(',').map(o => o.trim()).filter(Boolean)
          : [],
      }),
    })

    const j = await r.json()
    setSaving(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }

    setFormOpen(false)
    setForm({ fieldName: '', fieldLabel: '', fieldType: 'text', entity: 'product', isRequired: false, options: '' })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce champ ? Les valeurs existantes seront perdues.')) return
    await fetch(`/api/settings/custom-fields/${id}`, { method: 'DELETE' })
    load()
  }

  const input = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '14px', outline: 'none',
  }

  const label = {
    display: 'block', fontSize: '13px',
    fontWeight: 500 as const, color: 'var(--muted)', marginBottom: '6px',
  }

  return (
    <div>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '14px', padding: '28px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
              Champs personnalisés
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Ajoutez vos propres champs sur les produits, clients ou fournisseurs selon vos besoins métier.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              background: '#3b82f6', color: 'white', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Nouveau champ
          </button>
        </div>

        {/* Formulaire création */}
        {formOpen && (
          <form onSubmit={handleCreate} style={{
            background: 'var(--background)', border: '1px solid var(--card-border)',
            borderRadius: '10px', padding: '20px', marginBottom: '16px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={label}>
                  Nom technique * <span style={{ fontSize: '11px', fontWeight: 400 }}>(sans espaces)</span>
                </label>
                <input
                  style={input} required value={form.fieldName}
                  onChange={e => set('fieldName', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder={examples.fieldName}
                />
              </div>
              <div>
                <label style={label}>Label affiché *</label>
                <input
                  style={input} required value={form.fieldLabel}
                  onChange={e => set('fieldLabel', e.target.value)}
                  placeholder={examples.fieldLabel}
                />
              </div>
              <div>
                <label style={label}>Type de champ</label>
                <select style={input} value={form.fieldType} onChange={e => set('fieldType', e.target.value)}>
                  {fieldTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Appliquer à</label>
                <select style={input} value={form.entity} onChange={e => set('entity', e.target.value)}>
                  {Object.entries(entityLabels).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              {form.fieldType === 'select' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>
                    Options <span style={{ fontSize: '11px', fontWeight: 400 }}>(séparées par des virgules)</span>
                  </label>
                  <input
                    style={input} value={form.options}
                    onChange={e => set('options', e.target.value)}
                    placeholder="ex: Option 1, Option 2, Option 3"
                  />
                </div>
              )}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox" id="required" checked={form.isRequired}
                  onChange={e => set('isRequired', e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="required" style={{ ...label, marginBottom: 0, cursor: 'pointer' }}>
                  Champ obligatoire
                </label>
              </div>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={{
                padding: '9px 16px', borderRadius: '8px',
                background: '#3b82f6', color: 'white', border: 'none',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Création…' : 'Créer le champ'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} style={{
                padding: '9px 16px', borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: 'transparent', color: 'var(--muted)',
                fontSize: '13px', cursor: 'pointer',
              }}>
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des champs */}
        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement…</p>
        ) : fields.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            Aucun champ personnalisé — créez le premier.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fields.map(field => {
              const isSystem = !field.companyId
              return (
                <div key={field._id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: isSystem ? 'var(--accent-light)' : 'var(--background)',
                  border: '1px solid var(--card-border)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                        {field.fieldLabel}
                      </span>
                      {field.isRequired && (
                        <span style={{ fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: '10px' }}>
                          Requis
                        </span>
                      )}
                      {isSystem && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-text)', background: 'var(--accent-light)', padding: '1px 6px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Système
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {entityLabels[field.entity]} — {fieldTypes.find(t => t.value === field.fieldType)?.label}
                      {field.fieldName && ` — clé : ${field.fieldName}`}
                      {field.options?.length > 0 && ` — options : ${field.options.join(', ')}`}
                    </p>
                  </div>
                  {!isSystem && (
                    <button
                      onClick={() => handleDelete(field._id)}
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid #fecaca', background: 'transparent',
                        color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}