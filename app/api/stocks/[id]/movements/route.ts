import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    console.log('SESSION USER:', JSON.stringify(session?.user))
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id || (session.user as any).sub
    await connectDB()

    const { type, quantity, reason } = await req.json()
    const qte = Number(quantity)

    if (!type || !qte || qte <= 0) {
      return NextResponse.json({ error: 'Type et quantité requis' }, { status: 400 })
    }

    const stock = await Stock.findOne({ productId: id })
    if (!stock) return NextResponse.json({ error: 'Stock introuvable' }, { status: 404 })

    if (type === 'OUT' && stock.quantity < qte) {
      return NextResponse.json({ error: 'Stock insuffisant' }, { status: 409 })
    }

    const delta = type === 'IN' ? qte : -qte
    await Stock.updateOne({ _id: stock._id }, { $inc: { quantity: delta } })

    await StockMovement.create({
      productId: id,
      warehouseId: stock.warehouseId,
      userId,
      movementType: type,
      quantity: qte,
      reason: reason || '',
      referenceType: 'manual',
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Erreur movement:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    console.log('SESSION USER:', JSON.stringify(session?.user))
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const movements = await StockMovement.find({ productId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ items: movements })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}