import { connectDB } from './mongodb'
import Sector from '@/models/Sector'
import Category from '@/models/Category'

const sectorsData = [
  {
    name: 'Automobile',
    description: 'Gestion de pièces détachées, véhicules, compatibilité et entretien',
    modules: [
      'Gestion véhicules',
      'Compatibilité pièces',
      'Diagnostic',
      'Entretien & révision',
      'Traçabilité scan',
    ],
    isSystem: true,
    categories: [
      'Moteur & périphériques',
      'Transmission & chaîne cinématique',
      'Freinage & sécurité active',
      'Direction & trains roulants',
      'Suspension',
      'Électricité & électronique',
      'Carburant & dépollution',
      'Refroidissement & chauffage / clim',
      'Échappement',
      'Carrosserie & ouvrants',
      'Habitacle & sécurité passive',
      'Vitrages & visibilité',
      'Roues & pneumatiques',
      'Fluides & lubrifiants',
      'Fixations & consommables',
    ],
  },
  {
    name: 'Textile',
    description: 'Gestion de matières, fournitures, machines et produits finis',
    modules: [
      'Gestion des variantes',
      'Collections',
      'Fournisseurs matières',
      'Traçabilité scan',
    ],
    isSystem: true,
    categories: [
      'Tissus & matières',
      'Fils & bobines',
      'Aiguilles & outils',
      'Machines à coudre',
      'Fermetures & boutons',
      'Vêtements finis',
      'Accessoires',
    ],
  },
  {
    name: 'Alimentaire',
    description: 'Gestion de matériel, traçabilité DLC, lots et hygiène',
    modules: [
      'Traçabilité DLC',
      'Gestion des lots',
      'Température',
      'Allergènes',
      'Hygiène & HACCP',
      'Traçabilité scan',
    ],
    isSystem: true,
    categories: [
      'Couteaux & découpe',
      'Cuisson & fours',
      'Réfrigération & stockage froid',
      'Stockage sec & contenants',
      'Préparation & mixage',
      'Pâtisserie & boulangerie',
      'Hygiène & nettoyage',
      'Pesage & mesure',
      'Vaisselle & service',
    ],
  },
]

export async function seedSectors() {
  await connectDB()

  for (const sectorData of sectorsData) {
    const { categories, ...sectorFields } = sectorData

    const sector = await Sector.findOneAndUpdate(
      { name: sectorFields.name },
      { $setOnInsert: sectorFields },
      { upsert: true, new: true }
    )

    for (const catName of categories) {
      await Category.updateOne(
        { name: catName, sectorId: sector._id, parentId: null },
        { $setOnInsert: { name: catName, sectorId: sector._id, parentId: null } },
        { upsert: true }
      )
    }
  }

  console.log('✅ Secteurs et catégories insérés')
}