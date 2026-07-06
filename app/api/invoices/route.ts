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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const filter: any = { companyId }
    if (search) filter.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }]
    if (status) filter.status = status

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return NextResponse.json({ items: invoices })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { customerName, customerEmail, customerId, productionId, items, dueDate, notes } = await req.json()

    if (!customerName || !items?.length) {
      return NextResponse.json({ error: 'Client et articles requis' }, { status: 400 })
    }

    const count = await Invoice.countDocuments({ companyId })
    const invoiceNumber = `STK-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    // On stocke uniquement le HT
    const amount = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice))
    }, 0)

    const invoice = await Invoice.create({
      companyId,
      orderId: null,
      customerId: customerId || null,
      productionId: productionId || null,
      invoiceNumber,
      customerName,
      customerEmail,
      items,
      amount,
      status: 'DRAFT',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'Numéro déjà existant' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}