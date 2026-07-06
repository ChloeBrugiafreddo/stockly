'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Info, XCircle, ChevronRight, Bell } from 'lucide-react'

interface Alert {
  id: string
  type: 'danger' | 'warning' | 'info'
  category: string
  message: string
  link?: string
}

const alertStyles = {
  danger:  { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: XCircle },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: AlertTriangle },
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: Info },
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!alerts.length) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', borderRadius: '12px',
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      marginBottom: '24px',
    }}>
      <Bell size={16} color="#16a34a" />
      <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
        Tout est en ordre — aucune alerte active 🎉
      </p>
    </div>
  )

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header alertes */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', borderRadius: collapsed ? '12px' : '12px 12px 0 0',
          background: '#fef2f2', border: '1px solid #fecaca',
          cursor: 'pointer', borderBottom: collapsed ? undefined : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color="#dc2626" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#dc2626' }}>
          {collapsed ? 'Voir' : 'Réduire'}
        </span>
      </button>

      {/* Liste des alertes */}
      {!collapsed && (
        <div style={{
          border: '1px solid #fecaca', borderTop: 'none',
          borderRadius: '0 0 12px 12px', overflow: 'hidden',
        }}>
          {alerts.map((alert, i) => {
            const st = alertStyles[alert.type]
            const Icon = st.icon
            return (
              <div
                key={alert.id}
                onClick={() => alert.link && router.push(alert.link)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px',
                  background: st.bg,
                  borderBottom: i < alerts.length - 1 ? `1px solid ${st.border}` : 'none',
                  cursor: alert.link ? 'pointer' : 'default',
                  transition: 'opacity 0.1s',
                }}
              >
                <Icon size={16} color={st.color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: st.color, marginRight: '8px' }}>
                    {alert.category}
                  </span>
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    {alert.message}
                  </span>
                </div>
                {alert.link && <ChevronRight size={14} color={st.color} style={{ flexShrink: 0 }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}