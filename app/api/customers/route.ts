import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Customer from '@/models/Customer'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const filter: any = { companyId }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).limit(200).lean()
    return NextResponse.json({ items: customers })
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

    const { name, email, phone, address } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

    const customer = await Customer.create({ companyId, name, email, phone, address })
    return NextResponse.json(customer, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}