'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'

interface Props {
  name: string
  email: string
  initials: string
}

export function UserMenu({ name, email, initials }: Props) {
  return (
    <div style={{
      borderTop: '1px solid var(--sidebar-border)',
      paddingTop: '12px',
      marginTop: '8px',
    }}>
      {/* Infos utilisateur */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px', borderRadius: '10px',
        marginBottom: '4px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent-light)', color: 'var(--accent-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {email}
          </p>
        </div>
      </div>

      {/* Bouton déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '8px 12px', borderRadius: '10px',
          border: 'none', background: 'transparent',
          color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#dc2626'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'
        }}
      >
        <LogOut size={16} />
        <span>Se déconnecter</span>
      </button>
    </div>
  )
}