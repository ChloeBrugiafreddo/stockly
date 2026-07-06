import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'
import Product from '@/models/Product'
import Invoice from '@/models/Invoice'
import StockMovement from '@/models/StockMovement'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    // 1. Production complète
    const production = await Production.findById(id).lean() as any
    if (!production) return NextResponse.json({ error: 'Production introuvable' }, { status: 404 })

    // 2. Enrichit les composants avec les infos produit et prix
    const enrichedComponents = await Promise.all(
      production.components.map(async (component: any) => {
        const product = await Product.findById(component.productId)
          .populate('supplierId', 'name')
          .lean() as any
        return {
          ...component,
          productName: product?.name || component.name,
          productSku: product?.sku || component.ref,
          unitPrice: product?.price || 0,
          totalPrice: (product?.price || 0) * component.quantity,
          supplier: product?.supplierId?.name || '—',
          category: product?.categoryId || null,
        }
      })
    )

    // 3. Factures liées à cette production
    const invoices = await Invoice.find({
      companyId,
      productionId: production._id,
    }).lean()

    // 4. Mouvements de stock liés à cette production
    const movements = await StockMovement.find({
      referenceId: production._id,
      referenceType: 'production',
    }).sort({ createdAt: -1 }).lean()

    // 5. Stats financières
    const totalComponentsCost = enrichedComponents.reduce(
      (sum: number, c: any) => sum + c.totalPrice, 0
    )
    const totalInvoiced = invoices.reduce(
    (sum, inv) => sum + inv.amount, // ← HT seulement, pas + inv.taxAmount
    0
    )
    const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0) // ← HT aussi

    return NextResponse.json({
      production: { ...production, components: enrichedComponents },
      invoices,
      movements,
      stats: {
        totalComponents: enrichedComponents.length,
        totalQuantityUsed: enrichedComponents.reduce((sum: number, c: any) => sum + c.quantity, 0),
        totalComponentsCost,
        totalInvoiced,
        totalPaid,
        margin: totalInvoiced - totalComponentsCost,
      },
    })
  } catch (e: any) {
    console.error('Production identity error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}