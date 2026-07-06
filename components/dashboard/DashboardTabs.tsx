'use client'

import { useState } from 'react'
import { DashboardClient } from './DashboardClient'
import { KPIClient } from './KPIClient'

export function DashboardTabs() {
  const [tab, setTab] = useState<'overview' | 'kpi'>('overview')

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Onglets */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '12px', padding: '4px',
        marginBottom: '28px', width: 'fit-content',
      }}>
        {[
          { id: 'overview', label: '📊 Vue d\'ensemble' },
          { id: 'kpi',      label: '📈 KPI & Rapports' },
        ].map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none',
                background: active ? 'var(--background)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--muted)',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <DashboardClient />}
      {tab === 'kpi'      && <KPIClient />}
    </div>
  )
}