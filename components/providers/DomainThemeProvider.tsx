'use client'

import { useEffect, createContext, useContext, useState } from 'react'
import { useSession } from 'next-auth/react'

interface DomainThemeContextType {
  vocab: {
    product: string
    products: string
    production: string
    productions: string
    stock: string
  }
  icons: {
    product: string
    production: string
    supplier: string
    customer: string
  }
  primary: string
  sectorName: string
}

const defaultTheme: DomainThemeContextType = {
  vocab: {
    product: 'Produit',
    products: 'Produits',
    production: 'Production',
    productions: 'Productions',
    stock: 'Stock',
  },
  icons: {
    product: '📦',
    production: '🏭',
    supplier: '🚚',
    customer: '👤',
  },
  primary: '#3b82f6',
  sectorName: '',
}

const DomainThemeContext = createContext<DomainThemeContextType>(defaultTheme)

export function useDomainTheme() {
  return useContext(DomainThemeContext)
}

export function DomainThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [themeData, setThemeData] = useState<DomainThemeContextType>(defaultTheme)

  useEffect(() => {
    if (!session) return

    fetch('/api/theme')
      .then(r => r.json())
      .then(data => {
        if (!data.theme) return

        // Applique les CSS variables sur le document
        const root = document.documentElement
        const t = data.theme
        root.style.setProperty('--domain-primary', t.primary)
        root.style.setProperty('--domain-primary-light', t.primaryLight)
        root.style.setProperty('--domain-primary-dark', t.primaryDark)
        root.style.setProperty('--domain-secondary', t.secondary)
        root.style.setProperty('--domain-accent', t.accent)
        root.style.setProperty('--domain-accent-light', t.accentLight)

        // Met à jour le contexte pour le vocab et les icônes
        setThemeData({
          vocab: data.vocab,
          icons: data.icons,
          primary: t.primary,
          sectorName: data.sectorName,
        })
      })
  }, [session])

  return (
    <DomainThemeContext.Provider value={themeData}>
      {children}
    </DomainThemeContext.Provider>
  )
}