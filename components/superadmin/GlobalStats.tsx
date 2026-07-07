'use client'

import { useEffect, useState } from 'react'

interface Props { dark: boolean }

export function GlobalStats({ dark }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/superadmin/stats')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  const c = {
    card:   dark ? '#131d35' : '#ffffff',
    card2:  dark ? '#0f1629' : '#f9fafb',
    border: dark ? '#1e2d4a' : '#dde3f0',
    text:   dark ? '#f0f4ff' : '#0d1117',
    muted:  dark ? '#7b8db0' : '#6b7280',
    bar:    dark ? '#1e2d4a' : '#f0f4ff',
  }

  if (loading) return <p style={{ color: c.muted }}>Chargement…</p>

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer l'entreprise "${name}" et toutes ses données ? Cette action est irréversible.`)) return
    const r = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' })
    if (r.ok) {
        fetch('/api/superadmin/stats').then(r => r.json()).then(d => setData(d))
    }
    }

  return (
    <div style={{ maxWidth: '1100px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: c.text, marginBottom: '28px', letterSpacing: '-0.5px' }}>
        Vue d'ensemble de la plateforme
      </h2>

      {/* KPI globaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {[
          { label: 'Entreprises', value: data?.companies || 0, icon: '🏢', color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'Utilisateurs', value: data?.users || 0, icon: '👥', color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Produits', value: data?.products || 0, icon: '📦', color: '#059669', bg: '#f0fdf4' },
          { label: 'Devis', value: data?.invoices || 0, icon: '📋', color: '#d97706', bg: '#fffbeb' },
          { label: 'Productions', value: data?.productions || 0, icon: '🏭', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Mouvements', value: data?.movements || 0, icon: '📊', color: '#0891b2', bg: '#f0f9ff' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '20px 16px', borderRadius: '14px', textAlign: 'center',
            background: dark ? c.card : stat.bg,
            border: `1px solid ${dark ? c.border : stat.bg}`,
            boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{stat.icon}</span>
            <p style={{ fontSize: '28px', fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: '4px', letterSpacing: '-1px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '11px', color: c.muted, fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Deux colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* Répartition par secteur */}
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: '16px', padding: '24px',
          boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '20px' }}>
            Entreprises par secteur
          </h3>
          {!data?.sectorStats?.length ? (
            <p style={{ color: c.muted, fontSize: '13px' }}>Aucune donnée</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.sectorStats.map((s: any) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
                  <p style={{ fontSize: '13px', color: c.text, fontWeight: 600, width: '110px', flexShrink: 0 }}>{s.name}</p>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: c.bar, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: s.color || '#1d4ed8',
                      width: `${Math.min((s.count / Math.max(data.companies, 1)) * 100, 100)}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: s.color || '#1d4ed8', width: '24px', textAlign: 'right' }}>{s.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activité globale */}
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: '16px', padding: '24px',
          boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '20px' }}>
            Activité globale
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Moyenne produits/entreprise', value: data?.companies > 0 ? Math.round(data.products / data.companies) : 0, icon: '📦' },
              { label: 'Moyenne utilisateurs/entreprise', value: data?.companies > 0 ? Math.round(data.users / data.companies) : 0, icon: '👥' },
              { label: 'Moyenne devis/entreprise', value: data?.companies > 0 ? Math.round(data.invoices / data.companies) : 0, icon: '📋' },
              { label: 'Total secteurs disponibles', value: data?.sectors || 0, icon: '🎨' },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                background: c.card2, border: `1px solid ${c.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                  <p style={{ fontSize: '13px', color: c.muted, fontWeight: 500 }}>{stat.label}</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 800, color: c.text }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste détaillée des entreprises */}
      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text }}>
            Toutes les entreprises ({data?.companies || 0})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
                <tr style={{ background: c.card2, borderBottom: `1px solid ${c.border}` }}>
                    {['Entreprise', 'Secteur', 'Utilisateurs', 'Produits', 'Devis', 'Productions', 'Créée le', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: c.muted, whiteSpace: 'nowrap', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {h}
                    </th>
                    ))}
                </tr>
                </thead>
            <tbody>
              {data?.companiesDetail?.map((company: any, i: number) => (
                <tr key={company._id} style={{ borderBottom: i < data.companiesDetail.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: c.text }}>{company.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {company.sector ? (
                      <span style={{
                        fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                        background: company.sector.theme?.primaryLight || '#f1f5f9',
                        color: company.sector.theme?.primary || '#64748b',
                        border: `1px solid ${company.sector.theme?.primary || '#64748b'}30`,
                      }}>
                        {company.sector.icons?.product} {company.sector.name}
                      </span>
                    ) : (
                      <span style={{ color: c.muted, fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>{company.userCount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>{company.productCount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#d97706' }}>{company.invoiceCount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{company.productionCount}</td>
                  <td style={{ padding: '12px 16px', color: c.muted, fontSize: '12px' }}>
                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                        onClick={() => handleDelete(company._id, company.name)}
                        style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1.5px solid #fecaca', background: '#fef2f2',
                        color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        🗑️
                    </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}