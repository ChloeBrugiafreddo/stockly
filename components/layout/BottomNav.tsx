'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileText, MoreHorizontal } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/stock',     icon: Package,         label: 'Stock' },
  { href: '/customers', icon: Users,           label: 'Clients' },
  { href: '/invoices',  icon: FileText,        label: 'Factures' },
  { href: '/more',      icon: MoreHorizontal,  label: 'Plus' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="bottom-nav-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        borderTop: '1px solid var(--topbar-border)',
        background: 'var(--topbar-bg)',
        alignItems: 'center',
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 0',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}