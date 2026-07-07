import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

// Pages accessibles par rôle
const rolePermissions: Record<string, string[]> = {
  Admin: [
    '/dashboard', '/stock', '/productions', '/customers',
    '/suppliers', '/invoices', '/settings', '/reports',
  ],
  Manager: [
    '/dashboard', '/stock', '/productions', '/customers',
    '/suppliers', '/invoices',
  ],
  Employé: [
    '/dashboard', '/stock', '/productions',
  ],
}

function isAllowed(pathname: string, roleName: string): boolean {
  const allowed = rolePermissions[roleName] || rolePermissions['Employé']
  return allowed.some(path => pathname.startsWith(path))
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const roleName = (session.user as any).roleName || 'Employé'

  // Vérifie les permissions
  if (pathname && !isAllowed(pathname, roleName)) {
    redirect('/dashboard')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '32px', paddingBottom: '80px',
          background: 'var(--background)',
        }}>
          {children}
        </main>
      </div>
      <BottomNav />
      <OnboardingWizard />
    </div>
  )
}