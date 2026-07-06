import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import Customer from '@/models/Customer'
import Supplier from '@/models/Supplier'
import StockMovement from '@/models/StockMovement'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    // 1. Produits de cette company
    const products = await Product.find({ companyId }).lean()
    const productIds = products.map((p: any) => p._id)

    // 2. Total produits
    const totalProducts = products.length

    // 3. Stock par état — filtré par les produits de la company
    const allStocks = await Stock.find({ productId: { $in: productIds } }).lean()
    const stockMap = new Map()
    allStocks.forEach((s: any) => {
      stockMap.set(s.productId.toString(), s)
    })

    let ruptures = 0
    let stockBas = 0
    products.forEach((p: any) => {
      const stock = stockMap.get(p._id.toString())
      if (!stock) return
      if (stock.quantity === 0) ruptures++
      else if (stock.minimumStock > 0 && stock.quantity <= stock.minimumStock) stockBas++
    })

    // 4. Clients et fournisseurs de cette company
    const totalCustomers = await Customer.countDocuments({ companyId })
    const totalSuppliers = await Supplier.countDocuments({ companyId })

    // 5. Mouvements récents — uniquement les produits de cette company
    const recentMovements = await StockMovement.find({ productId: { $in: productIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const movementsWithProduct = await Promise.all(
      recentMovements.map(async (m: any) => {
        const product = products.find((p: any) => p._id.toString() === m.productId.toString()) as any
        return {
          ...m,
          productName: product?.name || 'Produit supprimé',
          productSku: product?.sku || '—',
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalProducts,
        ruptures,
        stockBas,
        totalCustomers,
        totalSuppliers,
      },
      recentMovements: movementsWithProduct,
    })
  } catch (e: any) {
    console.error('Dashboard error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}