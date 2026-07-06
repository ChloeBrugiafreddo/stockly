import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    await connectDB()

    const { productId, quantity, addedBy } = await req.json()
    const qte = Number(quantity)

    if (!productId || !qte || qte <= 0) {
      return NextResponse.json({ error: 'Produit et quantité requis' }, { status: 400 })
    }

    // 1. Récupère la production
    const production = await Production.findById(id)
    if (!production) return NextResponse.json({ error: 'Production introuvable' }, { status: 404 })

    // 2. Récupère le produit
    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    // 3. Vérifie le stock disponible
    const stock = await Stock.findOne({ productId })
    if (!stock) return NextResponse.json({ error: 'Stock introuvable' }, { status: 404 })
    if (stock.quantity < qte) {
      return NextResponse.json({ error: `Stock insuffisant (disponible : ${stock.quantity})` }, { status: 409 })
    }

    const now = new Date()

    // 4. Décrémente le stock
    await Stock.updateOne({ _id: stock._id }, { $inc: { quantity: -qte } })

    // 5. Enregistre le mouvement avec la référence de la production
    await StockMovement.create({
      productId,
      warehouseId: stock.warehouseId,
      userId,
      movementType: 'OUT',
      quantity: qte,
      reason: `Utilisé dans la production : ${production.name} (${production.ref})`,
      referenceId: production._id,
      referenceType: 'production',
    })

    // 6. Ajoute le composant à la production
    await Production.updateOne(
      { _id: id },
      {
        $push: {
          components: {
            productId,
            ref: product.sku,
            name: product.name,
            quantity: qte,
            addedAt: now,
            addedBy: addedBy || '',
          }
        }
      }
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}