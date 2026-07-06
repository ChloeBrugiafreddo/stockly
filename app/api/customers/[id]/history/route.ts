import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Invoice from '@/models/Invoice'
import Production from '@/models/Production'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const invoices = await Invoice.find({ companyId, customerId: id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ invoices })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}