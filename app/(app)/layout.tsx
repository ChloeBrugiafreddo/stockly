import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

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