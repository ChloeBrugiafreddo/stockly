import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    await connectDB()

    // 1. Récupère la production
    const production = await Production.findById(id)
    if (!production) return NextResponse.json({ error: 'Production introuvable' }, { status: 404 })

    // 2. Trouve le composant
    const component = production.components.find(
      (c: any) => c._id.toString() === componentId
    )
    if (!component) return NextResponse.json({ error: 'Composant introuvable' }, { status: 404 })

    const now = new Date()

    // 3. Remet la quantité en stock
    await Stock.updateOne(
      { productId: component.productId },
      { $inc: { quantity: component.quantity } }
    )

    // 4. Enregistre le mouvement de retour
    await StockMovement.create({
      productId: component.productId,
      warehouseId: (await Stock.findOne({ productId: component.productId }))?.warehouseId,
      userId,
      movementType: 'IN',
      quantity: component.quantity,
      reason: `Retrait de la production : ${production.name} (${production.ref})`,
      referenceId: production._id,
      referenceType: 'production',
    })

    // 5. Retire le composant
    await Production.updateOne(
      { _id: id },
      { $pull: { components: { _id: component._id } } }
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}