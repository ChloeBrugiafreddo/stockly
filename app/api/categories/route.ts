import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Category from '@/models/Category'
import Company from '@/models/Company'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const company = await Company.findById(companyId)
    const categories = await Category.find({ sectorId: company?.sectorId })
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({ categories })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}