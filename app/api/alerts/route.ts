import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import Invoice from '@/models/Invoice'
import Production from '@/models/Production'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const domain = (session.user as any).domain
    await connectDB()

    const alerts: {
      id: string
      type: 'danger' | 'warning' | 'info'
      category: string
      message: string
      link?: string
    }[] = []

    // ── 1. Alertes stock (tous domaines) ──────────────────────────────────
    const products = await Product.find({ companyId }).lean()
    const productIds = products.map((p: any) => p._id)
    const stocks = await Stock.find({ productId: { $in: productIds } }).lean()

    const stockMap = new Map()
    stocks.forEach((s: any) => stockMap.set(s.productId.toString(), s))

    let ruptureCount = 0
    let stockBasCount = 0

    products.forEach((p: any) => {
      const stock = stockMap.get(p._id.toString())
      if (!stock) return
      if (stock.quantity === 0) ruptureCount++
      else if (stock.minimumStock > 0 && stock.quantity <= stock.minimumStock) stockBasCount++
    })

    if (ruptureCount > 0) {
      alerts.push({
        id: 'rupture',
        type: 'danger',
        category: 'Stock',
        message: `${ruptureCount} produit${ruptureCount > 1 ? 's' : ''} en rupture de stock`,
        link: '/stock',
      })
    }

    if (stockBasCount > 0) {
      alerts.push({
        id: 'stock-bas',
        type: 'warning',
        category: 'Stock',
        message: `${stockBasCount} produit${stockBasCount > 1 ? 's' : ''} sous le seuil d'alerte`,
        link: '/stock',
      })
    }

    // ── 2. Alertes factures (tous domaines) ───────────────────────────────
    const now = new Date()

    const overdueInvoices = await Invoice.countDocuments({
      companyId,
      status: 'SENT',
      dueDate: { $lt: now },
    })

    if (overdueInvoices > 0) {
      alerts.push({
        id: 'invoices-overdue',
        type: 'danger',
        category: 'Factures',
        message: `${overdueInvoices} facture${overdueInvoices > 1 ? 's' : ''} en retard de paiement`,
        link: '/invoices',
      })
    }

    // Factures envoyées depuis plus de 30 jours sans paiement
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pendingOldInvoices = await Invoice.countDocuments({
      companyId,
      status: 'SENT',
      createdAt: { $lt: thirtyDaysAgo },
    })

    if (pendingOldInvoices > 0) {
      alerts.push({
        id: 'invoices-old',
        type: 'warning',
        category: 'Factures',
        message: `${pendingOldInvoices} facture${pendingOldInvoices > 1 ? 's' : ''} en attente depuis plus de 30 jours`,
        link: '/invoices',
      })
    }

    // ── 3. Alertes Productions (tous domaines) ────────────────────────────
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const oldProductions = await Production.countDocuments({
      companyId,
      status: 'EN_COURS',
      createdAt: { $lt: sevenDaysAgo },
    })

    if (oldProductions > 0) {
      alerts.push({
        id: 'productions-old',
        type: 'warning',
        category: 'Productions',
        message: `${oldProductions} production${oldProductions > 1 ? 's' : ''} en cours depuis plus de 7 jours`,
        link: '/productions',
      })
    }

    // ── 4. Alertes spécifiques au domaine ─────────────────────────────────

    if (domain === 'Alimentaire') {
      // Produits sans seuil d'alerte configuré
      const noThresholdCount = stocks.filter((s: any) => s.minimumStock === 0 && s.quantity > 0).length
      if (noThresholdCount > 0) {
        alerts.push({
          id: 'no-threshold',
          type: 'info',
          category: 'Alimentaire',
          message: `${noThresholdCount} produit${noThresholdCount > 1 ? 's' : ''} sans seuil d'alerte configuré — pensez à la traçabilité DLC`,
          link: '/stock',
        })
      }
    }

    if (domain === 'Automobile') {
      // Productions en cours depuis plus de 3 jours (véhicule en atelier)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const vehiclesInShop = await Production.countDocuments({
        companyId,
        status: 'EN_COURS',
        createdAt: { $lt: threeDaysAgo },
      })

      if (vehiclesInShop > 0) {
        alerts.push({
          id: 'vehicles-waiting',
          type: 'warning',
          category: 'Automobile',
          message: `${vehiclesInShop} véhicule${vehiclesInShop > 1 ? 's' : ''} en atelier depuis plus de 3 jours`,
          link: '/productions',
        })
      }
    }

    if (domain === 'Textile') {
      // Productions terminées non facturées
      const uninvoicedProductions = await Production.countDocuments({
        companyId,
        status: 'TERMINE',
      })

      const invoicedProductions = await Invoice.countDocuments({
        companyId,
        productionId: { $ne: null },
      })

      const toInvoice = uninvoicedProductions - invoicedProductions
      if (toInvoice > 0) {
        alerts.push({
          id: 'uninvoiced',
          type: 'info',
          category: 'Textile',
          message: `${toInvoice} production${toInvoice > 1 ? 's' : ''} terminée${toInvoice > 1 ? 's' : ''} sans facture associée`,
          link: '/productions',
        })
      }
    }

    return NextResponse.json({ alerts, count: alerts.length })
  } catch (e: any) {
    console.error('Alerts error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}