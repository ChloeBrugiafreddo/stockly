import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Customer from '@/models/Customer'
import Supplier from '@/models/Supplier'
import Production from '@/models/Production'
import Invoice from '@/models/Invoice'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (q.length < 2) return NextResponse.json({ results: [] })

    await connectDB()

    const regex = { $regex: q, $options: 'i' }
    const filter = { companyId }

    const [products, customers, suppliers, productions, invoices] = await Promise.all([
      Product.find({ ...filter, $or: [{ name: regex }, { sku: regex }] }).limit(5).lean(),
      Customer.find({ ...filter, $or: [{ name: regex }, { email: regex }] }).limit(5).lean(),
      Supplier.find({ ...filter, $or: [{ name: regex }, { email: regex }] }).limit(5).lean(),
      Production.find({ ...filter, $or: [{ name: regex }, { ref: regex }] }).limit(5).lean(),
      Invoice.find({ ...filter, $or: [{ invoiceNumber: regex }, { customerName: regex }] }).limit(5).lean(),
    ])

    const results = [
      ...products.map((p: any) => ({ type: 'product', icon: '📦', label: p.name, sub: p.sku, href: '/stock', id: p._id })),
      ...customers.map((c: any) => ({ type: 'customer', icon: '👤', label: c.name, sub: c.email || 'Client', href: '/customers', id: c._id })),
      ...suppliers.map((s: any) => ({ type: 'supplier', icon: '🚚', label: s.name, sub: s.email || 'Fournisseur', href: '/suppliers', id: s._id })),
      ...productions.map((p: any) => ({ type: 'production', icon: '🏭', label: p.name, sub: p.ref, href: '/productions', id: p._id })),
      ...invoices.map((i: any) => ({ type: 'invoice', icon: '📄', label: i.invoiceNumber, sub: i.customerName, href: '/invoices', id: i._id })),
    ]

    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}