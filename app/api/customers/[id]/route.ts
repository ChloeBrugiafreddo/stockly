import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Customer from '@/models/Customer'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const customer = await Customer.findByIdAndUpdate(id, body, { new: true })
    if (!customer) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    return NextResponse.json(customer)
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
    await Customer.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}