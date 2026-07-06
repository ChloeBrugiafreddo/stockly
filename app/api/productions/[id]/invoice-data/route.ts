import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Production from '@/models/Production'
import Product from '@/models/Product'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()

    const production = await Production.findById(id).lean() as any
    if (!production) return NextResponse.json({ error: 'Production introuvable' }, { status: 404 })

    // Récupère le prix de chaque composant
    const lines = await Promise.all(
      production.components.map(async (component: any) => {
        const product = await Product.findById(component.productId).lean() as any
        return {
          description: `${component.name} (réf: ${component.ref})`,
          quantity: component.quantity,
          unitPrice: product?.price || 0,
        }
      })
    )

    return NextResponse.json({ lines, production })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}