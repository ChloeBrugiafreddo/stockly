import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import CustomField from '@/models/CustomField'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const field = await CustomField.findById(id)
    if (!field) return NextResponse.json({ error: 'Champ introuvable' }, { status: 404 })

    // On ne peut supprimer que ses propres champs (pas les champs système)
    if (field.companyId?.toString() !== companyId) {
      return NextResponse.json({ error: 'Non autorisé — champ système' }, { status: 403 })
    }

    await CustomField.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}