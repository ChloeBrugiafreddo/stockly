export interface DomainTheme {
  name: string
  // Couleurs
  primary: string
  primaryLight: string
  primaryDark: string
  secondary: string
  secondaryLight: string
  accent: string
  // Vocabulaire
  vocab: {
    products: string      // "Pièces", "Matières", "Équipements"
    product: string       // "Pièce", "Matière", "Équipement"
    productions: string   // "Véhicules", "Collections", "Recettes"
    production: string    // "Véhicule", "Collection", "Recette"
    stock: string         // "Pièces en stock", "Matières premières", "Inventaire"
  }
  // Emojis/icônes contextuelles
  icons: {
    product: string
    production: string
    supplier: string
    customer: string
    alert: string
  }
  // CSS variables générées
  cssVars: Record<string, string>
}

export const domainThemes: Record<string, DomainTheme> = {
  'Automobile': {
    name: 'Automobile',
    primary: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryDark: '#1e3a8a',
    secondary: '#0ea5e9',
    secondaryLight: '#f0f9ff',
    accent: '#f59e0b',
    vocab: {
      products: 'Pièces',
      product: 'Pièce',
      productions: 'Véhicules',
      production: 'Véhicule',
      stock: 'Pièces en stock',
    },
    icons: {
      product: '🔧',
      production: '🚗',
      supplier: '🏭',
      customer: '👤',
      alert: '⚠️',
    },
    cssVars: {
      '--domain-primary': '#1d4ed8',
      '--domain-primary-light': '#eff6ff',
      '--domain-primary-dark': '#1e3a8a',
      '--domain-secondary': '#0ea5e9',
      '--domain-secondary-light': '#f0f9ff',
      '--domain-accent': '#f59e0b',
      '--domain-accent-light': '#fffbeb',
      '--sidebar-accent': '#1e3a8a',
    },
  },

  'Textile': {
    name: 'Textile',
    primary: '#7c3aed',
    primaryLight: '#f5f3ff',
    primaryDark: '#5b21b6',
    secondary: '#ec4899',
    secondaryLight: '#fdf2f8',
    accent: '#06b6d4',
    vocab: {
      products: 'Matières',
      product: 'Matière',
      productions: 'Collections',
      production: 'Collection',
      stock: 'Matières premières',
    },
    icons: {
      product: '🧵',
      production: '👗',
      supplier: '🏭',
      customer: '👤',
      alert: '⚠️',
    },
    cssVars: {
      '--domain-primary': '#7c3aed',
      '--domain-primary-light': '#f5f3ff',
      '--domain-primary-dark': '#5b21b6',
      '--domain-secondary': '#ec4899',
      '--domain-secondary-light': '#fdf2f8',
      '--domain-accent': '#06b6d4',
      '--domain-accent-light': '#ecfeff',
      '--sidebar-accent': '#5b21b6',
    },
  },

  'Alimentaire': {
    name: 'Alimentaire',
    primary: '#16a34a',
    primaryLight: '#f0fdf4',
    primaryDark: '#14532d',
    secondary: '#f59e0b',
    secondaryLight: '#fffbeb',
    accent: '#ef4444',
    vocab: {
      products: 'Équipements',
      product: 'Équipement',
      productions: 'Recettes & Lots',
      production: 'Recette',
      stock: 'Inventaire cuisine',
    },
    icons: {
      product: '🍳',
      production: '👨‍🍳',
      supplier: '🏭',
      customer: '👤',
      alert: '⚠️',
    },
    cssVars: {
      '--domain-primary': '#16a34a',
      '--domain-primary-light': '#f0fdf4',
      '--domain-primary-dark': '#14532d',
      '--domain-secondary': '#f59e0b',
      '--domain-secondary-light': '#fffbeb',
      '--domain-accent': '#ef4444',
      '--domain-accent-light': '#fef2f2',
      '--sidebar-accent': '#14532d',
    },
  },

  'default': {
    name: 'Général',
    primary: '#3b82f6',
    primaryLight: '#eff6ff',
    primaryDark: '#1d4ed8',
    secondary: '#6366f1',
    secondaryLight: '#eef2ff',
    accent: '#f59e0b',
    vocab: {
      products: 'Produits',
      product: 'Produit',
      productions: 'Productions',
      production: 'Production',
      stock: 'Stock',
    },
    icons: {
      product: '📦',
      production: '🏭',
      supplier: '🚚',
      customer: '👤',
      alert: '⚠️',
    },
    cssVars: {
      '--domain-primary': '#3b82f6',
      '--domain-primary-light': '#eff6ff',
      '--domain-primary-dark': '#1d4ed8',
      '--domain-secondary': '#6366f1',
      '--domain-secondary-light': '#eef2ff',
      '--domain-accent': '#f59e0b',
      '--domain-accent-light': '#fffbeb',
      '--sidebar-accent': '#1d4ed8',
    },
  },
}

export function getDomainTheme(domain: string): DomainTheme {
  return domainThemes[domain] || domainThemes['default']
}