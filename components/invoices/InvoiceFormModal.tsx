'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Zap } from 'lucide-react'
import { TVA_RATE } from './InvoicesClient'

interface Props {
  onClose: () => void
  onSaved: () => void
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

export function InvoiceFormModal({ onClose, onSaved }: Props) {
  const [customers, setCustomers] = useState<any[]>([])
  const [productions, setProductions] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedProductionId, setSelectedProductionId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [importingProduction, setImportingProduction] = useState(false)

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.items || []))
    fetch('/api/productions?status=EN_COURS').then(r => r.json()).then(d => setProductions(d.items || []))
  }, [])

  function handleSelectCustomer(id: string) {
    setSelectedCustomerId(id)
    if (!id) { setCustomerName(''); setCustomerEmail(''); return }
    const customer = customers.find(c => c._id === id)
    if (customer) { setCustomerName(customer.name); setCustomerEmail(customer.email || '') }
  }

  async function handleSelectProduction(id: string) {
    setSelectedProductionId(id)
    if (!id) return
    setImportingProduction(true)
    try {
      const r = await fetch(`/api/productions/${id}/invoice-data`)
      const j = await r.json()
      if (j.lines?.length) {
        const existingLines = lineItems.filter(l => l.description.trim() !== '')
        setLineItems([...j.lines, ...existingLines])
      }
    } finally {
      setImportingProduction(false)
    }
  }

  function addLine() {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }])
  }

  function removeLine(i: number) {
    setLineItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, key: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: value } : item))
  }

  const totalHT = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tva = totalHT * TVA_RATE
  const totalTTC = totalHT + tva

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const r = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomerId || null,
        productionId: selectedProductionId || null,
        customerName,
        customerEmail,
        items: lineItems.filter(l => l.description.trim() !== ''),
        dueDate,
        notes,
      }),
    })

    const j = await r.json()
    setLoading(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    onSaved()
  }

  const input = {
    width: '100%', padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '13px', outline: 'none',
  }

  const label = {
    display: 'block', fontSize: '12px', fontWeight: 500 as const,
    color: 'var(--muted)', marginBottom: '4px',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '680px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>
            Nouveau devis
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px' }}>
          <form onSubmit={handleSubmit}>

            {/* Sélecteurs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={label}>Client existant</label>
                <select style={{ ...input, cursor: 'pointer' }} value={selectedCustomerId}
                  onChange={e => handleSelectCustomer(e.target.value)}>
                  <option value="">— Saisir manuellement —</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} color="#d97706" />
                    Lier à une production
                  </span>
                </label>
                <select style={{ ...input, cursor: 'pointer' }} value={selectedProductionId}
                  onChange={e => handleSelectProduction(e.target.value)}
                  disabled={importingProduction}>
                  <option value="">— Aucune production —</option>
                  {productions.map(p => (
                    <option key={p._id} value={p._id}>{p.ref} — {p.name}</option>
                  ))}
                </select>
                {importingProduction && (
                  <p style={{ fontSize: '11px', color: '#d97706', marginTop: '3px' }}>Import des composants…</p>
                )}
                {selectedProductionId && !importingProduction && (
                  <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '3px' }}>✓ Composants importés</p>
                )}
              </div>
            </div>

            {/* Infos client */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Nom du client *</label>
                <input style={input} required value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="ex: Jean Dupont ou Société ABC" />
              </div>
              <div>
                <label style={label}>Email du client</label>
                <input style={input} type="email" value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)} placeholder="client@exemple.com" />
              </div>
              <div>
                <label style={label}>Date d'expiration du devis</label>
                <input style={input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Lignes */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ ...label, marginBottom: 0 }}>Articles / Prestations *</label>
                <button type="button" onClick={addLine} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'transparent', color: 'var(--muted)',
                  fontSize: '12px', cursor: 'pointer',
                }}>
                  <Plus size={12} /> Ajouter une ligne
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 30px', gap: '8px', marginBottom: '6px' }}>
                {['Description', 'Qté', 'Prix unit. HT', ''].map(h => (
                  <p key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>{h}</p>
                ))}
              </div>

              {lineItems.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 30px', gap: '8px', marginBottom: '8px' }}>
                  <input style={input} required value={item.description}
                    onChange={e => updateLine(i, 'description', e.target.value)}
                    placeholder="Description de la prestation ou du produit" />
                  <input style={input} type="number" min="1" required value={item.quantity}
                    onChange={e => updateLine(i, 'quantity', Number(e.target.value))} />
                  <input style={input} type="number" min="0" step="0.01" required value={item.unitPrice}
                    onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} placeholder="0.00" />
                  <button type="button" onClick={() => removeLine(i)} disabled={lineItems.length === 1}
                    style={{
                      width: '30px', height: '34px', borderRadius: '6px',
                      border: '1px solid #fecaca', background: 'transparent',
                      color: '#dc2626', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: lineItems.length === 1 ? 0.4 : 1,
                    }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Totaux HT / TVA / TTC */}
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: '10px', padding: '14px 16px', marginTop: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total HT</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{totalHT.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>TVA (20%)</span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{tva.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>Total TTC</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Notes / Conditions</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="ex: Devis valable 30 jours, acompte de 30% à la commande..."
                rows={3}
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--card-border)',
                background: 'transparent', color: 'var(--foreground)',
                fontSize: '14px', cursor: 'pointer',
              }}>Annuler</button>
              <button type="submit" disabled={loading} style={{
                padding: '10px 20px', borderRadius: '10px',
                background: '#3b82f6', color: 'white', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Création…' : 'Créer le devis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}