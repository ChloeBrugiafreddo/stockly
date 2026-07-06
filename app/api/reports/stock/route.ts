import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const products = await Product.find({ companyId })
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .lean() as any[]

    const rows = []
    let totalValue = 0
    let totalQty = 0

    for (const product of products) {
      const stock = await Stock.findOne({ productId: product._id }).lean() as any
      const qty = stock?.quantity || 0
      const value = qty * (product.price || 0)
      totalValue += value
      totalQty += qty

      let etat = 'OK'
      if (qty === 0) etat = 'RUPTURE'
      else if (stock?.minimumStock > 0 && qty <= stock.minimumStock) etat = 'BAS'

      rows.push({
        sku: product.sku,
        name: product.name,
        category: product.categoryId?.name || '—',
        supplier: product.supplierId?.name || '—',
        quantity: qty,
        minimumStock: stock?.minimumStock || 0,
        unitPrice: product.price || 0,
        totalValue: value,
        etat,
      })
    }

    rows.sort((a, b) => {
      const order = { RUPTURE: 0, BAS: 1, OK: 2 }
      return order[a.etat as keyof typeof order] - order[b.etat as keyof typeof order]
    })

    return NextResponse.json({
      rows,
      summary: {
        totalProducts: products.length,
        totalQuantity: totalQty,
        totalValue,
        ruptures: rows.filter(r => r.etat === 'RUPTURE').length,
        stockBas: rows.filter(r => r.etat === 'BAS').length,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}