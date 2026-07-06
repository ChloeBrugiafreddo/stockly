import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const filter: any = { companyId }
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59')
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean() as any[]

    const rows = invoices.map(inv => ({
      number: inv.invoiceNumber,
      date: inv.createdAt,
      customer: inv.customerName,
      amountHT: inv.amount,
      amountTTC: inv.amount * 1.20,
      status: inv.status,
      dueDate: inv.dueDate,
    }))

    const accepted = rows.filter(r => r.status === 'PAID')
    const totalCA = accepted.reduce((s, r) => s + r.amountHT, 0)
    const tauxAcceptation = rows.length > 0 ? Math.round((accepted.length / rows.length) * 100) : 0

    return NextResponse.json({
      rows,
      summary: {
        total: rows.length,
        accepted: accepted.length,
        tauxAcceptation,
        totalCAHT: totalCA,
        totalCATTC: totalCA * 1.20,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}