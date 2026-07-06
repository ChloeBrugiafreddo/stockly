'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Users, Truck,
  FileText, Settings, Factory, Car,
  Shirt, Apple, Grid
} from 'lucide-react'
import { UserMenu } from './UserMenu'
import { useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/stock',       icon: Package,         label: 'Stock' },
  { href: '/productions', icon: Factory,         label: 'Productions' },
  { href: '/customers',   icon: Users,           label: 'Clients' },
  { href: '/suppliers',   icon: Truck,           label: 'Fournisseurs' },
  { href: '/invoices',    icon: FileText,        label: 'Factures' },
]

const domainIcons: Record<string, any> = {
  'Automobile': Car,
  'Textile': Shirt,
  'Alimentaire': Apple,
}

const domainColors: Record<string, string> = {
  'Automobile': '#1d4ed8',
  'Textile': '#7c3aed',
  'Alimentaire': '#16a34a',
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const domainName = user?.domain || ''
  const DomainIcon = domainIcons[domainName] || Grid
  const domainColor = domainColors[domainName] || '#64748b'

  return (
    <aside
      className="md-sidebar"
      style={{
        width: '220px',
        minWidth: '220px',
        height: '100%',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        flexDirection: 'column',
        padding: '20px 12px',
      }}
    >
      {/* Badge domaine */}
      {domainName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 12px', borderRadius: '10px',
          background: `${domainColor}15`,
          marginBottom: '16px',
        }}>
          <DomainIcon size={14} color={domainColor} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: domainColor }}>
            {domainName}
          </span>
        </div>
      )}

      {/* Nav principale */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '10px',
                textDecoration: 'none',
                background: active ? 'var(--accent-light)' : 'transparent',
                color: active ? 'var(--accent-text)' : 'var(--muted)',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Paramètres */}
      <Link
        href="/settings"
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 14px', borderRadius: '10px',
          textDecoration: 'none',
          background: pathname.startsWith('/settings') ? 'var(--accent-light)' : 'transparent',
          color: pathname.startsWith('/settings') ? 'var(--accent-text)' : 'var(--muted)',
          fontSize: '14px', marginBottom: '4px',
        }}
      >
        <Settings size={18} strokeWidth={1.8} />
        <span>Paramètres</span>
      </Link>

      {/* User menu avec déconnexion */}
      <UserMenu
        name={user?.name || ''}
        email={user?.email || ''}
        initials={initials}
      />
    </aside>
  )
}