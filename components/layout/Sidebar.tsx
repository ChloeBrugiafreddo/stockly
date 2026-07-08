'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Users, Truck,
  FileText, Settings, Factory, Car,
  Shirt, Apple, Grid, BarChart2,
  ScanLine
} from 'lucide-react'
import { UserMenu } from './UserMenu'
import { useSession } from 'next-auth/react'
import { useDomainTheme } from '../providers/DomainThemeProvider'

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

const allNavItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',    roles: ['Admin', 'Manager', 'Employé'] },
  { href: '/stock',       icon: Package,         label: 'Stock',        roles: ['Admin', 'Manager', 'Employé'] },
  { href: '/scan',        icon: ScanLine,        label: 'Scanner',      roles: ['Admin', 'Manager', 'Employé'] },
  { href: '/productions', icon: Factory,         label: 'Productions',  roles: ['Admin', 'Manager', 'Employé'] },
  { href: '/customers',   icon: Users,           label: 'Clients',      roles: ['Admin', 'Manager'] },
  { href: '/suppliers',   icon: Truck,           label: 'Fournisseurs', roles: ['Admin', 'Manager'] },
  { href: '/invoices',    icon: FileText,        label: 'Devis',        roles: ['Admin', 'Manager'] },
]

export function Sidebar() {
  const { vocab, icons, primary, sectorName } = useDomainTheme()
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const domainName = user?.domain || ''
  const roleName = user?.roleName || 'Employé'
  const DomainIcon = domainIcons[domainName] || Grid
  const domainColor = domainColors[domainName] || '#64748b'

  const navItems = allNavItems.filter(item => item.roles.includes(roleName))

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
      {sectorName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '12px',
          background: 'var(--domain-primary-light)',
          marginBottom: '16px',
          border: '1px solid var(--domain-primary)',
        }}>
          <span style={{ fontSize: '16px' }}>{icons.product}</span>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--domain-primary)', display: 'block' }}>
              {sectorName}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--domain-primary)', opacity: 0.7 }}>
              {vocab.products} · {vocab.productions}
            </span>
          </div>
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
                background: active ? 'var(--domain-primary-light)' : 'transparent',
                color: active ? 'var(--domain-primary)' : 'var(--muted)',
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

      {/* Paramètres — Admin uniquement */}
      {roleName === 'Admin' && (
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
      )}

      {/* User menu avec déconnexion */}
      <UserMenu
        name={user?.name || ''}
        email={user?.email || ''}
        initials={initials}
        roleName={roleName}
      />
    </aside>
  )
}