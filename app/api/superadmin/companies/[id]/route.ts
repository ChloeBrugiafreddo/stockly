import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import Company from '@/models/Company'
import User from '@/models/User'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'
import Invoice from '@/models/Invoice'
import Production from '@/models/Production'
import Customer from '@/models/Customer'
import Supplier from '@/models/Supplier'

async function checkSuperAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sa_session')
  return session?.value === 'authenticated'
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  await connectDB()

  // Supprime tout ce qui appartient à cette entreprise
  const productIds = await Product.find({ companyId: id }).distinct('_id')

  await Promise.all([
    User.deleteMany({ companyId: id }),
    StockMovement.deleteMany({ productId: { $in: productIds } }),
    Stock.deleteMany({ productId: { $in: productIds } }),
    Product.deleteMany({ companyId: id }),
    Invoice.deleteMany({ companyId: id }),
    Production.deleteMany({ companyId: id }),
    Customer.deleteMany({ companyId: id }),
    Supplier.deleteMany({ companyId: id }),
    Company.findByIdAndDelete(id),
  ])

  return NextResponse.json({ ok: true })
}