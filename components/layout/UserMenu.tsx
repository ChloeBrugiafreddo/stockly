'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin:   { bg: '#eff6ff', color: '#1d4ed8' },
  Manager: { bg: '#f5f3ff', color: '#7c3aed' },
  Employé: { bg: '#f0fdf4', color: '#16a34a' },
}

interface Props {
  name: string
  email: string
  initials: string
  roleName: string
}

export function UserMenu({ name, email, initials, roleName }: Props) {
  const roleStyle = roleColors[roleName] || roleColors['Employé']

  return (
    <div style={{
      borderTop: '1px solid var(--sidebar-border)',
      paddingTop: '12px',
      marginTop: '8px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px', borderRadius: '10px',
        marginBottom: '4px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: roleStyle.bg, color: roleStyle.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '1px 6px',
              borderRadius: '8px', background: roleStyle.bg, color: roleStyle.color,
            }}>
              {roleName}
            </span>
          </div>
        </div>
      </div>

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