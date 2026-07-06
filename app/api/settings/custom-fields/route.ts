import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import CustomField from '@/models/CustomField'
import Company from '@/models/Company'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const company = await Company.findById(companyId).lean() as any

    // Uniquement les champs du secteur de CETTE company + ses propres champs custom
    const fields = await CustomField.find({
      $or: [
        { sectorId: company?.sectorId, companyId: null },  // champs système du bon secteur
        { companyId },                                      // champs custom de la company
      ]
    }).lean()

    return NextResponse.json({ fields })
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

    const company = await Company.findById(companyId).lean() as any
    const { fieldName, fieldLabel, fieldType, entity, isRequired, options } = await req.json()

    if (!fieldName || !fieldLabel || !fieldType || !entity) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    const field = await CustomField.create({
      companyId,
      sectorId: company?.sectorId,
      entity,
      fieldName,
      fieldLabel,
      fieldType,
      options: options || [],
      isRequired: isRequired || false,
    })

    return NextResponse.json(field, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}