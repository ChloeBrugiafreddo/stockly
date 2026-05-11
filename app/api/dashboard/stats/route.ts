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

    // Total produits
    const totalProducts = await Product.countDocuments({ companyId })

    // Stock par état
    const allStocks = await Stock.find().lean()
    const stockMap = new Map()
    allStocks.forEach((s: any) => {
      stockMap.set(s.productId.toString(), s)
    })

    const products = await Product.find({ companyId }).lean()
    let ruptures = 0
    let stockBas = 0

    products.forEach((p: any) => {
      const stock = stockMap.get(p._id.toString())
      if (!stock) return
      if (stock.quantity === 0) ruptures++
      else if (stock.minimumStock > 0 && stock.quantity <= stock.minimumStock) stockBas++
    })

    // Clients et fournisseurs
    const totalCustomers = await Customer.countDocuments({ companyId })
    const totalSuppliers = await Supplier.countDocuments({ companyId })

    // Mouvements récents (10 derniers)
    const recentMovements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Enrichit les mouvements avec le nom du produit
    const movementsWithProduct = await Promise.all(
      recentMovements.map(async (m: any) => {
        const product = await Product.findById(m.productId).lean() as any
        return {
          ...m,
          productName: product?.name || 'Produit supprimé',
          productSku: product?.sku || '—',
        }
      })
    )

    // Mouvements par jour sur 7 jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyMovements = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$movementType'
          },
          count: { $sum: 1 },
          totalQty: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.month': 1, '_id.day': 1 } }
    ])

    return NextResponse.json({
      stats: {
        totalProducts,
        ruptures,
        stockBas,
        totalCustomers,
        totalSuppliers,
      },
      recentMovements: movementsWithProduct,
      weeklyMovements,
    })
  } catch (e: any) {
    console.error('Dashboard error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}