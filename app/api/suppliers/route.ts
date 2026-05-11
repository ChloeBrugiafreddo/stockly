import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Supplier from '@/models/Supplier'

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
        { country: { $regex: search, $options: 'i' } },
      ]
    }

    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 }).limit(200).lean()
    return NextResponse.json({ items: suppliers })
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

    const { name, email, phone, address, country } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

    const supplier = await Supplier.create({ companyId, name, email, phone, address, country })
    return NextResponse.json(supplier, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}