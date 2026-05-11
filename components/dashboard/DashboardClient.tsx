'use client'

import { useEffect, useState } from 'react'
import {
  Package, Users, Truck, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle, TrendingUp
} from 'lucide-react'

interface Stats {
  totalProducts: number
  ruptures: number
  stockBas: number
  totalCustomers: number
  totalSuppliers: number
}

interface Movement {
  _id: string
  movementType: 'IN' | 'OUT'
  quantity: number
  reason: string
  productName: string
  productSku: string
  createdAt: string
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Récupère le nom depuis la session
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => setUserName(d?.user?.name?.split(' ')[0] || ''))

    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats)
        setMovements(d.recentMovements || [])
      })
      .finally(() => setLoading(false))
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const statCards = stats ? [
    {
      label: 'Produits en stock',
      value: stats.totalProducts,
      icon: Package,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      label: 'Ruptures de stock',
      value: stats.ruptures,
      icon: AlertTriangle,
      color: '#dc2626',
      bg: '#fef2f2',
    },
    {
      label: 'Stock bas',
      value: stats.stockBas,
      icon: TrendingUp,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Clients',
      value: stats.totalCustomers,
      icon: Users,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Fournisseurs',
      value: stats.totalSuppliers,
      icon: Truck,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
  ] : []

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Chargement du tableau de bord…</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
          Bonjour{userName ? `, ${userName}` : ''} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Alertes */}
      {stats && (stats.ruptures > 0 || stats.stockBas > 0) && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '12px', padding: '14px 18px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={18} color="#dc2626" />
          <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: 500 }}>
            {stats.ruptures > 0 && `${stats.ruptures} rupture${stats.ruptures > 1 ? 's' : ''} de stock`}
            {stats.ruptures > 0 && stats.stockBas > 0 && ' • '}
            {stats.stockBas > 0 && `${stats.stockBas} produit${stats.stockBas > 1 ? 's' : ''} en stock bas`}
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px', padding: '20px 24px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: stat.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <Icon size={20} color={stat.color} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Mouvements récents */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)' }}>
            Mouvements récents
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            10 derniers
          </span>
        </div>

        {movements.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            Aucun mouvement enregistré pour l'instant.
          </div>
        ) : (
          <div>
            {movements.map((m, i) => (
              <div key={m._id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 24px',
                borderBottom: i < movements.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}>
                {/* Icône */}
                {m.movementType === 'IN'
                  ? <ArrowUpCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                  : <ArrowDownCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                }

                {/* Produit */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' }}>
                    {m.productName}
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace', marginLeft: '8px' }}>
                      {m.productSku}
                    </span>
                  </p>
                  {m.reason && (
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      {m.reason}
                    </p>
                  )}
                </div>

                {/* Quantité */}
                <span style={{
                  fontSize: '14px', fontWeight: 700,
                  color: m.movementType === 'IN' ? '#16a34a' : '#dc2626',
                  flexShrink: 0,
                }}>
                  {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                </span>

                {/* Date */}
                <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0, minWidth: '100px', textAlign: 'right' }}>
                  {formatDate(m.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}