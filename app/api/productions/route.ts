import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'

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
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ref:  { $regex: search, $options: 'i' } },
      ]
    }
    if (status) filter.status = status

    const productions = await Production.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    const customerId = searchParams.get('customerId') || ''
    if (customerId) filter.customerId = customerId


    return NextResponse.json({ items: productions })
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

    const { ref, name, description, notes } = await req.json()
    if (!ref || !name) {
      return NextResponse.json({ error: 'Référence et nom requis' }, { status: 400 })
    }

    const production = await Production.create({
      companyId, ref, name, description, notes, status: 'EN_COURS',
    })

    return NextResponse.json(production, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'Cette référence existe déjà' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}