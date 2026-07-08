import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import Supplier from '@/models/Supplier'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code') || ''

    await connectDB()

    // Cherche par SKU exact ou nom
    const product = await Product.findOne({
      companyId,
      $or: [
        { sku: code },
        { sku: { $regex: code, $options: 'i' } },
      ],
    })
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .lean() as any

    if (!product) {
      return NextResponse.json({ product: null, code })
    }

    // Récupère le stock actuel
    const stock = await Stock.findOne({ productId: product._id }).lean() as any

    return NextResponse.json({
      product: {
        ...product,
        currentStock: stock?.quantity || 0,
        minimumStock: stock?.minimumStock || product.minimumStock || 0,
      },
      code,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}