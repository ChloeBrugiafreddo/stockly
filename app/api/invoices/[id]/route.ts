import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    // Si on passe en PAID, enregistre la date de paiement
    if (body.status === 'PAID') {
      body.paidAt = new Date()
    }

    const invoice = await Invoice.findByIdAndUpdate(id, body, { new: true })
    if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })

    return NextResponse.json(invoice)
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
    const invoice = await Invoice.findById(id)
    if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })

    // On ne peut supprimer qu'un brouillon
    if (invoice.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Seuls les brouillons peuvent être supprimés' }, { status: 400 })
    }

    await Invoice.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}