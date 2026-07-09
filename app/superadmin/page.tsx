'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectorManager } from '@/components/superadmin/SectorManager'
import { GlobalStats } from '@/components/superadmin/GlobalStats'

export default function SuperAdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stats' | 'sectors'>('stats')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sa-theme')
    if (saved === 'dark') setDark(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('sa-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    fetch('/api/superadmin/check')
      .then(r => {
        if (r.ok) setAuthenticated(true)
        else router.push('/superadmin/login')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/superadmin/auth', { method: 'DELETE' })
    router.push('/superadmin/login')
  }

  const c = {
    bg:     dark ? '#0a0f1e' : '#f4f6fb',
    panel:  dark ? '#131d35' : '#ffffff',
    border: dark ? '#1e2d4a' : '#dde3f0',
    text:   dark ? '#f0f4ff' : '#0d1117',
    muted:  dark ? '#7b8db0' : '#6b7280',
    navBg:  dark ? '#0f1629' : '#ffffff',
    tabActive:   dark ? '#1d4ed8' : '#1d4ed8',
    tabInactive: dark ? 'transparent' : 'transparent',
    tabTextActive:   'white',
    tabTextInactive: dark ? '#7b8db0' : '#6b7280',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: c.muted, fontFamily: 'system-ui' }}>Chargement…</p>
    </div>
  )

  if (!authenticated) return null

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'background 0.2s' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '64px',
        background: c.navBg,
        borderBottom: `1px solid ${c.border}`,
        boxShadow: dark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>⚡</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: c.text, letterSpacing: '-0.3px' }}>
              Stockly <span style={{ color: '#1d4ed8' }}>Super Admin</span>
            </p>
            <p style={{ fontSize: '10px', color: c.muted, display: 'none' }} className="hide-mobile">
              Panneau d'administration global
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setDark(!dark)} style={{
            width: '34px', height: '34px', borderRadius: '8px',
            border: `1px solid ${c.border}`, background: c.panel,
            cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} style={{
            padding: '7px 12px', borderRadius: '8px',
            border: `1.5px solid ${c.border}`, background: 'transparent',
            color: c.muted, fontSize: '12px', cursor: 'pointer', fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '32px 40px' }}>

        {/* Onglets */}
        <div style={{
          display: 'flex', gap: '4px',
          background: c.panel, border: `1px solid ${c.border}`,
          borderRadius: '12px', padding: '4px',
          width: 'fit-content', marginBottom: '32px',
          boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {[
            { id: 'stats', label: '📊 Statistiques' },
            { id: 'sectors', label: '🎨 Secteurs métiers' },
          ].map(tab => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                padding: '9px 22px', borderRadius: '9px', border: 'none',
                background: active ? '#1d4ed8' : 'transparent',
                color: active ? 'white' : c.muted,
                fontSize: '14px', fontWeight: active ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: active ? '0 2px 8px rgba(29,78,216,0.3)' : 'none',
              }}>
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'stats'   && <GlobalStats dark={dark} />}
        {activeTab === 'sectors' && <SectorManager dark={dark} />}
      </div>
    </div>
  )
}