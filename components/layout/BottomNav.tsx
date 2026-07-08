'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, Package, Factory, Users, FileText, ScanLine, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)
  const roleName = (session?.user as any)?.roleName || 'Employé'

  const mainItems = [
    { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Manager', 'Employé'] },
    { href: '/stock',       icon: Package,         label: 'Stock',     roles: ['Admin', 'Manager', 'Employé'] },
    { href: '/productions', icon: Factory,         label: 'Productions', roles: ['Admin', 'Manager', 'Employé'] },
    { href: '/scan',        icon: ScanLine,        label: 'Scanner',   roles: ['Admin', 'Manager', 'Employé'] },
  ].filter(item => item.roles.includes(roleName))

  const moreItems = [
    { href: '/customers',   label: '👤 Clients',       roles: ['Admin', 'Manager'] },
    { href: '/suppliers',   label: '🚚 Fournisseurs',  roles: ['Admin', 'Manager'] },
    { href: '/invoices',    label: '📄 Devis',         roles: ['Admin', 'Manager'] },
    { href: '/settings',    label: '⚙️ Paramètres',    roles: ['Admin'] },
  ].filter(item => item.roles.includes(roleName))

  return (
    <>
      {/* Menu "Plus" */}
      {showMore && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setShowMore(false)}
        >
          <div
            style={{
              position: 'absolute', bottom: '64px', left: 0, right: 0,
              background: 'var(--background)',
              borderTop: '1px solid var(--card-border)',
              borderRadius: '16px 16px 0 0',
              padding: '16px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {moreItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setShowMore(false) }}
                  style={{
                    padding: '14px', borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    background: pathname.startsWith(item.href) ? 'var(--domain-primary-light, #eff6ff)' : 'var(--card-bg)',
                    color: pathname.startsWith(item.href) ? 'var(--domain-primary, #3b82f6)' : 'var(--foreground)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    textAlign: 'center' as const,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1px solid #fecaca', background: '#fef2f2',
                color: '#dc2626', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Nav principale */}
      <nav
        className="bottom-nav-mobile"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          borderTop: '1px solid var(--topbar-border)',
          background: 'var(--topbar-bg)',
          alignItems: 'center',
        }}
      >
        {mainItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px', padding: '10px 0',
              textDecoration: 'none',
              color: active ? 'var(--domain-primary, #3b82f6)' : 'var(--muted)',
              fontSize: '10px', fontWeight: 500,
            }}>
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Bouton Plus */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMore(!showMore)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px', padding: '10px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              color: showMore ? 'var(--domain-primary, #3b82f6)' : 'var(--muted)',
              fontSize: '10px', fontWeight: 500,
            }}
          >
            <MoreHorizontal size={20} strokeWidth={1.8} />
            <span>Plus</span>
          </button>
        )}
      </nav>
    </>
  )
}