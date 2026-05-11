import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Supplier from '@/models/Supplier'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const supplier = await Supplier.findByIdAndUpdate(id, body, { new: true })
    if (!supplier) return NextResponse.json({ error: 'Fournisseur introuvable' }, { status: 404 })
    return NextResponse.json(supplier)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    await Supplier.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}