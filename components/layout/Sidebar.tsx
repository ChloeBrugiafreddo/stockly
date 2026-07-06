'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, Truck, FileText, Settings, Car, Factory } from 'lucide-react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/stock',       icon: Package,         label: 'Stock' },
  { href: '/productions', icon: Factory,         label: 'Productions' },
  { href: '/customers',   icon: Users,           label: 'Clients' },
  { href: '/suppliers',   icon: Truck,           label: 'Fournisseurs' },
  { href: '/invoices',    icon: FileText,        label: 'Factures' },
]

export function Sidebar() {
  const pathname = usePathname()

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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                background: active ? 'var(--accent-light)' : 'transparent',
                color: active ? 'var(--accent-text)' : 'var(--muted)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{
        borderTop: '1px solid var(--sidebar-border)',
        paddingTop: '12px',
        marginTop: '12px',
      }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: 'var(--muted)',
            fontSize: '14px',
          }}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  )
}