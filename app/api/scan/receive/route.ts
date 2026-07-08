import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'
import Warehouse from '@/models/Warehouse'
import Product from '@/models/Product'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const userId = (session.user as any).id
    await connectDB()

    const { productId, quantity, supplierId, notes } = await req.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Produit et quantité requis' }, { status: 400 })
    }

    // Vérifie que le produit appartient à cette entreprise
    const product = await Product.findOne({ _id: productId, companyId })
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    // Trouve ou crée l'entrepôt par défaut
    let warehouse = await Warehouse.findOne({ companyId })
    if (!warehouse) {
      warehouse = await Warehouse.create({
        companyId,
        name: 'Entrepôt principal',
        location: '',
      })
    }

    // Met à jour le stock
    await Stock.updateOne(
      { productId, warehouseId: warehouse._id },
      { $inc: { quantity: Number(quantity) } },
      { upsert: true }
    )

    // Crée le mouvement
    await StockMovement.create({
      productId,
      warehouseId: warehouse._id,
      userId,
      movementType: 'IN',
      quantity: Number(quantity),
      reason: notes || 'Réception colis fournisseur (scan)',
      referenceType: 'scan',
      supplierId: supplierId || null,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}