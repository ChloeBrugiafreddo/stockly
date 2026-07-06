'use client'

import { useState } from 'react'
import { User, Building2, Sliders } from 'lucide-react'
import { ProfileSettings } from './ProfileSettings'
import { CompanySettings } from './CompanySettings'
import { CustomFieldsSettings } from './CustomFieldsSettings'

const tabs = [
  { id: 'profile',       icon: User,      label: 'Profil' },
  { id: 'company',       icon: Building2, label: 'Entreprise' },
  { id: 'custom-fields', icon: Sliders,   label: 'Champs personnalisés' },
]

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
          Paramètres
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Gérez votre profil, votre entreprise et personnalisez Stockly
        </p>
      </div>

      {/* Onglets */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '12px', padding: '4px',
        marginBottom: '28px', width: 'fit-content',
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: active ? 'var(--background)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--muted)',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenu */}
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'company' && <CompanySettings />}
      {activeTab === 'custom-fields' && <CustomFieldsSettings />}
    </div>
  )
}