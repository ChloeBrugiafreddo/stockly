import { connectDB } from './mongodb'
import Sector from '@/models/Sector'
import Category from '@/models/Category'

export async function seedSectors() {
  await connectDB()

  const sectors = [
    {
      name: 'Automobile',
      description: 'Gestion des pièces détachées et véhicules',
      isSystem: true,
      theme: {
        primary:      '#1d4ed8',
        primaryLight: '#eff6ff',
        primaryDark:  '#1e3a8a',
        secondary:    '#0ea5e9',
        accent:       '#f59e0b',
        accentLight:  '#fffbeb',
      },
      vocab: {
        product:     'Pièce',
        products:    'Pièces',
        production:  'Véhicule',
        productions: 'Véhicules',
        stock:       'Pièces en stock',
      },
      icons: {
        product:    '🔧',
        production: '🚗',
        supplier:   '🏭',
        customer:   '👤',
      },
      defaultCategories: [
        'Moteur & périphériques',
        'Freinage & sécurité active',
        'Suspension',
        'Transmission & chaîne cinématique',
        'Carrosserie & ouvrants',
        'Électricité & électronique',
        'Habitacle & sécurité passive',
        'Refroidissement & chauffage / clim',
        'Échappement',
        'Roues & pneumatiques',
        'Direction & trains roulants',
        'Vitrages & visibilité',
        'Fluides & lubrifiants',
        'Fixations & consommables',
        'Carburant & dépollution',
      ],
    },
    {
      name: 'Textile',
      description: 'Gestion des matières premières et collections',
      isSystem: true,
      theme: {
        primary:      '#7c3aed',
        primaryLight: '#f5f3ff',
        primaryDark:  '#5b21b6',
        secondary:    '#ec4899',
        accent:       '#06b6d4',
        accentLight:  '#ecfeff',
      },
      vocab: {
        product:     'Matière',
        products:    'Matières',
        production:  'Collection',
        productions: 'Collections',
        stock:       'Matières premières',
      },
      icons: {
        product:    '🧵',
        production: '👗',
        supplier:   '🏭',
        customer:   '👤',
      },
      defaultCategories: [
        'Tissus naturels',
        'Tissus synthétiques',
        'Fils & laines',
        'Boutons & fermetures',
        'Doublures & entoilages',
        'Élastiques & rubans',
        'Broderies & dentelles',
        'Teintures & colorants',
        'Accessoires de couture',
        'Emballages & étiquettes',
      ],
    },
    {
      name: 'Alimentaire',
      description: 'Gestion des équipements et traçabilité',
      isSystem: true,
      theme: {
        primary:      '#16a34a',
        primaryLight: '#f0fdf4',
        primaryDark:  '#14532d',
        secondary:    '#f59e0b',
        accent:       '#ef4444',
        accentLight:  '#fef2f2',
      },
      vocab: {
        product:     'Équipement',
        products:    'Équipements',
        production:  'Recette',
        productions: 'Recettes & Lots',
        stock:       'Inventaire cuisine',
      },
      icons: {
        product:    '🍳',
        production: '👨‍🍳',
        supplier:   '🏭',
        customer:   '👤',
      },
      defaultCategories: [
        'Cuisson & four',
        'Découpe & préparation',
        'Réfrigération',
        'Ustensiles',
        'Vaisselle & service',
        'Nettoyage & hygiène',
        'Stockage & conservation',
        'Électroménager',
        'Emballage',
        'Sécurité alimentaire',
      ],
    },
  ]

  for (const sectorData of sectors) {
    const { defaultCategories, ...sectorFields } = sectorData
    const sector = await Sector.findOneAndUpdate(
      { name: sectorFields.name },
      { $set: sectorFields },
      { upsert: true, new: true }
    )

    // Crée les catégories par défaut
    for (const catName of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catName, sectorId: sector._id },
        { $set: { name: catName, sectorId: sector._id } },
        { upsert: true }
      )
    }
  }

  return { ok: true, message: 'Secteurs et thèmes insérés' }
}