import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'
import Product from '@/models/Product'
import Invoice from '@/models/Invoice'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const productions = await Production.find({ companyId }).lean() as any[]

    const rows = await Promise.all(productions.map(async (prod) => {
      let componentsCost = 0
      for (const comp of prod.components) {
        const product = await Product.findById(comp.productId).lean() as any
        componentsCost += (product?.price || 0) * comp.quantity
      }

      const invoice = await Invoice.findOne({ companyId, productionId: prod._id }).lean() as any

      return {
        ref: prod.ref,
        name: prod.name,
        status: prod.status,
        componentsCount: prod.components.length,
        componentsCost,
        quotedAmount: invoice?.amount || 0,
        createdAt: prod.createdAt,
      }
    }))

    const totalCost = rows.reduce((s, r) => s + r.componentsCost, 0)

    return NextResponse.json({
      rows,
      summary: {
        total: rows.length,
        enCours: rows.filter(r => r.status === 'EN_COURS').length,
        terminees: rows.filter(r => r.status === 'TERMINE').length,
        totalCost,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}