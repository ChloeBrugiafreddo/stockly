import { NextResponse } from 'next/server'
import { seedSectors } from '@/lib/seed'

export async function GET() {
  // ⚠️ À supprimer après le premier lancement !
  await seedSectors()
  return NextResponse.json({ message: 'Seed terminé' })
}