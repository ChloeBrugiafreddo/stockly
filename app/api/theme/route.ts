import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Company from '@/models/Company'
import Sector from '@/models/Sector'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const company = await Company.findById(companyId).lean() as any
    if (!company?.sectorId) {
      return NextResponse.json({ theme: null, vocab: null, icons: null })
    }

    const sector = await Sector.findById(company.sectorId).lean() as any
    if (!sector) return NextResponse.json({ theme: null, vocab: null, icons: null })

    return NextResponse.json({
      sectorName: sector.name,
      theme: sector.theme,
      vocab: sector.vocab,
      icons: sector.icons,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}