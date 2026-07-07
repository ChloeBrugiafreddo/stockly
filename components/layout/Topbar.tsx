import { auth } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Logo } from '@/components/ui/Logo'
import { Search, Bell } from 'lucide-react'
import { NotificationsPanel } from './NotificationsPanel'
import { GlobalSearch } from './GlobalSearch'

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
        <GlobalSearch />

        {/* Notifications */}
        <NotificationsPanel />

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