import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Sector from '@/models/Sector'

export async function GET() {
  try {
    await connectDB()
    const sectors = await Sector.find({ isSystem: true })
    return NextResponse.json({ sectors })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}