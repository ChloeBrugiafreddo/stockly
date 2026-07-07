import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import Sector from '@/models/Sector'

async function checkSuperAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sa_session')
  return session?.value === 'authenticated'
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const sector = await Sector.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(sector)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { id } = await params
  await connectDB()

  const sector = await Sector.findById(id)
  if (sector?.isSystem) {
    return NextResponse.json({ error: 'Impossible de supprimer un secteur système' }, { status: 400 })
  }

  await Sector.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}