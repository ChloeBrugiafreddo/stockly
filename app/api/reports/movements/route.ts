import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import StockMovement from '@/models/StockMovement'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const products = await Product.find({ companyId }).lean() as any[]
    const productIds = products.map(p => p._id)
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    const filter: any = { productId: { $in: productIds } }
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59')
    }

    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .lean() as any[]

    const rows = movements.map(m => {
      const product = productMap.get(m.productId.toString())
      return {
        date: m.createdAt,
        productName: product?.name || '—',
        productSku: product?.sku || '—',
        type: m.movementType,
        quantity: m.quantity,
        reason: m.reason || '—',
        referenceType: m.referenceType || 'manual',
      }
    })

    const totalIn = rows.filter(r => r.type === 'IN').reduce((s, r) => s + r.quantity, 0)
    const totalOut = rows.filter(r => r.type === 'OUT').reduce((s, r) => s + r.quantity, 0)

    return NextResponse.json({
      rows,
      summary: { totalMovements: rows.length, totalIn, totalOut }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}