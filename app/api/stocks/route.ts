import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import Warehouse from '@/models/Warehouse'
import Company from '@/models/Company'
import Category from '@/models/Category'
// GET — liste des stocks de l'entreprise connectée
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''

    const filter: any = { companyId }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]
    }
    if (categoryId) filter.categoryId = categoryId

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    const productsWithStock = await Promise.all(
      products.map(async (product: any) => {
        const stockDocs = await Stock.find({ productId: product._id }).lean()
        const totalQuantity = stockDocs.reduce((sum: number, s: any) => sum + s.quantity, 0)
        const minimumStock = stockDocs[0]?.minimumStock || 0

        let etat = 'OK'
        if (totalQuantity === 0) etat = 'RUPTURE'
        else if (minimumStock > 0 && totalQuantity <= minimumStock) etat = 'BAS'

        return { ...product, totalQuantity, minimumStock, etat }
      })
    )

    return NextResponse.json({ items: productsWithStock })
  } catch (e: any) {
    console.error('Erreur GET stocks:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — créer un produit + son stock initial
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const body = await req.json()
    const {
      sku, name, description, price,
      categoryId, supplierId,
      quantity = 0, minimumStock = 0, maximumStock = 0,
    } = body

    if (!sku || !name) {
      return NextResponse.json({ error: 'SKU et nom requis' }, { status: 400 })
    }

    // Récupère ou crée l'entrepôt par défaut
    let warehouse = await Warehouse.findOne({ companyId })
    if (!warehouse) {
      warehouse = await Warehouse.create({
        companyId,
        name: 'Entrepôt principal',
        location: '',
      })
    }

    // Récupère le sectorId de l'entreprise connectée
    const company = await Company.findById(companyId)

    // Crée le produit
    const product = await Product.create({
      companyId,
      sectorId: company?.sectorId || null,
      sku,
      name,
      description,
      price: Number(price) || 0,
      categoryId: categoryId || null,
      supplierId: supplierId || null,
      status: 'active',
    })

    // Crée le stock associé
    await Stock.create({
      productId: product._id,
      warehouseId: warehouse._id,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      maximumStock: Number(maximumStock),
    })

    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'Ce SKU existe déjà' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}