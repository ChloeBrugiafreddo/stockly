import { auth } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Logo } from '@/components/ui/Logo'
import { Search, Bell } from 'lucide-react'

export async function Topbar() {
  const session = await auth()
  const user = session?.user as any
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      style={{
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: '1px solid var(--topbar-border)',
        background: 'var(--topbar-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Logo variant="full" height={32} />

      {/* Actions droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Barre recherche */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--muted)',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '200px',
          }}
        >
          <Search size={15} strokeWidth={1.8} />
          <span>Rechercher…</span>
          <kbd style={{
            marginLeft: 'auto',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '6px',
            background: 'var(--background)',
            color: 'var(--muted)',
            border: '1px solid var(--card-border)',
          }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.8} />
          <span style={{
            position: 'absolute',
            top: '9px',
            right: '9px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3b82f6',
          }} />
        </button>

        <ThemeToggle />

        {/* Avatar */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            background: 'var(--accent-light)',
            color: 'var(--accent-text)',
            cursor: 'pointer',
          }}
          title={user?.name || ''}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}