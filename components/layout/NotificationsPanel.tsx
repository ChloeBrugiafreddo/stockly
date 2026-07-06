'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, AlertTriangle, Info, XCircle, ChevronRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Alert {
  id: string
  type: 'danger' | 'warning' | 'info'
  category: string
  message: string
  link?: string
}

const alertStyles = {
  danger:  { color: '#dc2626', icon: XCircle },
  warning: { color: '#d97706', icon: AlertTriangle },
  info:    { color: '#1d4ed8', icon: Info },
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
  }, [])

  // Ferme le panel si on clique dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/alerts')
      const j = await r.json()
      setAlerts(j.alerts || [])
    } finally {
      setLoading(false)
    }
  }

  function handleAlertClick(link?: string) {
    if (link) {
      router.push(link)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '12px',
          border: '1px solid var(--card-border)',
          background: open ? 'var(--accent-light)' : 'transparent',
          color: open ? 'var(--accent-text)' : 'var(--muted)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
        {alerts.length > 0 && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: alerts.some(a => a.type === 'danger') ? '#dc2626' : '#d97706',
          }} />
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: 0,
          width: '360px', borderRadius: '14px',
          background: 'var(--background)', border: '1px solid var(--card-border)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 50, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', borderBottom: '1px solid var(--card-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="var(--foreground)" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
                Notifications
              </span>
              {alerts.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  background: '#fef2f2', color: '#dc2626',
                  padding: '1px 8px', borderRadius: '10px',
                }}>
                  {alerts.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Liste alertes */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Chargement…
              </p>
            ) : alerts.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#f0fdf4', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Bell size={20} color="#16a34a" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                  Tout est en ordre !
                </p>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Aucune alerte active pour le moment.
                </p>
              </div>
            ) : (
              alerts.map((alert, i) => {
                const st = alertStyles[alert.type]
                const Icon = st.icon
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert.link)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '14px 18px',
                      borderBottom: i < alerts.length - 1 ? '1px solid var(--card-border)' : 'none',
                      cursor: alert.link ? 'pointer' : 'default',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (alert.link) (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: alert.type === 'danger' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={st.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: st.color, marginBottom: '2px' }}>
                        {alert.category}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.4 }}>
                        {alert.message}
                      </p>
                    </div>
                    {alert.link && (
                      <ChevronRight size={14} color="var(--muted)" style={{ flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer — bouton aide */}
          <div style={{
            padding: '12px 18px', borderTop: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
          }}>
            <button
              onClick={() => {
                // Réouvre le wizard en supprimant onboardingDone
                fetch('/api/onboarding/reset', { method: 'POST' })
                  .then(() => window.location.reload())
                setOpen(false)
              }}
              style={{
                width: '100%', padding: '8px', borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: 'transparent', color: 'var(--muted)',
                fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              ✨ Revoir le guide de démarrage
            </button>
          </div>
        </div>
      )}
    </div>
  )
}