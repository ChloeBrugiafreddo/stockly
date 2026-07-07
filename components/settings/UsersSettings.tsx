'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin:   { bg: '#eff6ff', color: '#1d4ed8' },
  Manager: { bg: '#f5f3ff', color: '#7c3aed' },
  'Employé': { bg: '#f0fdf4', color: '#16a34a' },
}

export function UsersSettings() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '',
    password: '', roleName: 'Employé',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const r = await fetch('/api/settings/users')
    const j = await r.json()
    setUsers(j.users || [])
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
    const r = await fetch('/api/settings/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setSaving(false)
    if (!r.ok) { setError(j.error || 'Erreur'); return }
    setFormOpen(false)
    setForm({ firstname: '', lastname: '', email: '', password: '', roleName: 'Employé' })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await fetch(`/api/settings/users/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleRoleChange(id: string, roleName: string) {
    await fetch(`/api/settings/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleName }),
    })
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
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: '14px', padding: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            Membres de l'équipe
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Créez des accès pour vos collaborateurs. Ils partageront le même espace de travail.
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
          Créer un accès
        </button>
      </div>

      {/* Explication des rôles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
        marginBottom: '20px',
      }}>
        {[
          { role: 'Admin', desc: 'Accès complet — paramètres, utilisateurs, tous les modules', color: '#1d4ed8', bg: '#eff6ff' },
          { role: 'Manager', desc: 'Stock, productions, clients, fournisseurs, devis — pas les paramètres', color: '#7c3aed', bg: '#f5f3ff' },
          { role: 'Employé', desc: 'Stock et productions uniquement', color: '#16a34a', bg: '#f0fdf4' },
        ].map(r => (
          <div key={r.role} style={{
            padding: '10px 14px', borderRadius: '10px',
            background: r.bg, border: `1px solid ${r.bg}`,
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: r.color, marginBottom: '3px' }}>{r.role}</p>
            <p style={{ fontSize: '11px', color: r.color, opacity: 0.8, lineHeight: 1.4 }}>{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Formulaire création */}
      {formOpen && (
        <form onSubmit={handleCreate} style={{
          background: 'var(--background)', border: '1px solid var(--card-border)',
          borderRadius: '12px', padding: '20px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px' }}>
            Créer un accès collaborateur
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={label}>Prénom *</label>
              <input style={input} required value={form.firstname}
                onChange={e => set('firstname', e.target.value)} placeholder="Prénom" />
            </div>
            <div>
              <label style={label}>Nom *</label>
              <input style={input} required value={form.lastname}
                onChange={e => set('lastname', e.target.value)} placeholder="Nom" />
            </div>
            <div>
              <label style={label}>Email *</label>
              <input style={input} type="email" required value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="email@exemple.com" />
            </div>
            <div>
              <label style={label}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...input, paddingRight: '40px' }}
                  type={showPassword ? 'text' : 'password'}
                  required value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="8 caractères minimum"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', padding: 0,
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Rôle *</label>
              <select style={{ ...input, cursor: 'pointer' }} value={form.roleName}
                onChange={e => set('roleName', e.target.value)}>
                <option value="Employé">Employé — Stock et productions uniquement</option>
                <option value="Manager">Manager — Tout sauf gestion des utilisateurs</option>
                <option value="Admin">Admin — Accès complet</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setFormOpen(false)} style={{
              padding: '9px 16px', borderRadius: '8px',
              border: '1px solid var(--card-border)',
              background: 'transparent', color: 'var(--muted)',
              fontSize: '13px', cursor: 'pointer',
            }}>Annuler</button>
            <button type="submit" disabled={saving} style={{
              padding: '9px 16px', borderRadius: '8px',
              background: '#3b82f6', color: 'white', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        </form>
      )}

      {/* Liste utilisateurs */}
      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(user => {
            const roleName = user.roleId?.name || 'Employé'
            const roleStyle = roleColors[roleName] || roleColors['Employé']
            const isCurrentUser = user._id === currentUserId

            return (
              <div key={user._id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '12px',
                background: isCurrentUser ? 'var(--accent-light)' : 'var(--background)',
                border: '1px solid var(--card-border)',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: roleStyle.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: roleStyle.color,
                }}>
                  {user.firstname?.[0]}{user.lastname?.[0]}
                </div>

                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                      {user.firstname} {user.lastname}
                    </p>
                    {isCurrentUser && (
                      <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--card-bg)', padding: '1px 8px', borderRadius: '10px' }}>
                        Vous
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{user.email}</p>
                </div>

                {/* Rôle modifiable */}
                {!isCurrentUser ? (
                  <select
                    value={roleName}
                    onChange={e => handleRoleChange(user._id, e.target.value)}
                    style={{
                      padding: '5px 10px', borderRadius: '8px',
                      border: `1px solid ${roleStyle.bg}`,
                      background: roleStyle.bg, color: roleStyle.color,
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="Employé">Employé</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '5px 10px',
                    borderRadius: '8px', background: roleStyle.bg, color: roleStyle.color,
                  }}>
                    {roleName}
                  </span>
                )}

                {/* Supprimer */}
                {!isCurrentUser && (
                  <button
                    onClick={() => handleDelete(user._id)}
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
  )
}