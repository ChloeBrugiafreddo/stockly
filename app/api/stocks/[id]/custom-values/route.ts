import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import CustomFieldValue from '@/models/CustomFieldValue'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const { values } = await req.json()
    // values = [{ customFieldId, value }]

    for (const v of values) {
      await CustomFieldValue.findOneAndUpdate(
        { customFieldId: v.customFieldId, entityId: id },
        { value: v.value },
        { upsert: true, new: true }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const values = await CustomFieldValue.find({ entityId: id }).lean()
    return NextResponse.json({ values })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}