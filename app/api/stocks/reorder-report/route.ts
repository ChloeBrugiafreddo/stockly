import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import Supplier from '@/models/Supplier'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const products = await Product.find({ companyId })
      .populate('supplierId', 'name email phone')
      .lean() as any[]

    const results = []

    for (const product of products) {
      const stock = await Stock.findOne({ productId: product._id }).lean() as any
      if (!stock) continue

      const qty = stock.quantity
      const seuil = stock.minimumStock

      if (qty === 0 || (seuil > 0 && qty <= seuil)) {
        const qtyToOrder = Math.max(seuil - qty, 1)
        results.push({
          _id: product._id,
          sku: product.sku,
          name: product.name,
          currentStock: qty,
          minimumStock: seuil,
          qtyToOrder,
          unitPrice: product.price || 0,
          estimatedCost: qtyToOrder * (product.price || 0),
          etat: qty === 0 ? 'RUPTURE' : 'BAS',
          supplier: product.supplierId || null,
        })
      }
    }

    // Groupe par fournisseur
    const grouped: Record<string, any> = {}
    for (const item of results) {
      const key = item.supplier?._id?.toString() || 'no-supplier'
      const supplierName = item.supplier?.name || 'Sans fournisseur'
      if (!grouped[key]) {
        grouped[key] = {
          supplier: item.supplier,
          supplierName,
          items: [],
          totalEstimated: 0,
        }
      }
      grouped[key].items.push(item)
      grouped[key].totalEstimated += item.estimatedCost
    }

    return NextResponse.json({
      groups: Object.values(grouped),
      totalItems: results.length,
      totalEstimated: results.reduce((sum, r) => sum + r.estimatedCost, 0),
      generatedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}