import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import Sector from '@/models/Sector'
import Category from '@/models/Category'

async function checkSuperAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sa_session')
  return session?.value === 'authenticated'
}

export async function GET() {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  await connectDB()
  const sectors = await Sector.find().lean()
  return NextResponse.json({ sectors })
}

export async function POST(req: Request) {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  await connectDB()

  const { name, description, theme, vocab, icons, defaultCategories } = await req.json()

  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const existing = await Sector.findOne({ name })
  if (existing) return NextResponse.json({ error: 'Ce secteur existe déjà' }, { status: 409 })

  const sector = await Sector.create({
    name, description,
    isSystem: false,
    theme: {
      primary:      theme?.primary      || '#3b82f6',
      primaryLight: theme?.primaryLight || '#eff6ff',
      primaryDark:  theme?.primaryDark  || '#1d4ed8',
      secondary:    theme?.secondary    || '#6366f1',
      accent:       theme?.accent       || '#f59e0b',
      accentLight:  theme?.accentLight  || '#fffbeb',
    },
    vocab: {
      product:     vocab?.product     || 'Produit',
      products:    vocab?.products    || 'Produits',
      production:  vocab?.production  || 'Production',
      productions: vocab?.productions || 'Productions',
      stock:       vocab?.stock       || 'Stock',
    },
    icons: {
      product:    icons?.product    || '📦',
      production: icons?.production || '🏭',
      supplier:   icons?.supplier   || '🚚',
      customer:   icons?.customer   || '👤',
    },
    defaultCategories: defaultCategories || [],
  })

  // Crée les catégories par défaut
  if (defaultCategories?.length) {
    for (const catName of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catName, sectorId: sector._id },
        { $set: { name: catName, sectorId: sector._id } },
        { upsert: true }
      )
    }
  }

  return NextResponse.json(sector, { status: 201 })
}