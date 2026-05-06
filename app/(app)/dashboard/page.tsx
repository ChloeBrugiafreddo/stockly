import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any
  const firstName = user?.name?.split(' ')[0]

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--foreground)',
          marginBottom: '4px',
        }}>
          Bonjour, {firstName} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Bienvenue sur votre espace Stockly
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Produits en stock', value: '—', color: '#3b82f6', bg: 'var(--accent-light)' },
          { label: 'Ruptures de stock', value: '—', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Commandes en cours', value: '—', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Alertes stock bas', value: '—', color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: stat.color,
              }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '26px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
      }}>
        {['Mouvements récents', 'Alertes'].map((title) => (
          <div
            key={title}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              padding: '20px 24px',
              minHeight: '180px',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px' }}>
              {title}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Les données apparaîtront ici une fois le stock configuré.
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}