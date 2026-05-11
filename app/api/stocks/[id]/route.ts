import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const { name, description, price, categoryId, supplierId, status, minimumStock, maximumStock } = body

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, categoryId, supplierId, status },
      { new: true }
    )
    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    if (minimumStock !== undefined || maximumStock !== undefined) {
    const updateData: any = {}
    if (minimumStock !== undefined && !isNaN(Number(minimumStock))) {
      updateData.minimumStock = Number(minimumStock)
    }
    if (maximumStock !== undefined && !isNaN(Number(maximumStock))) {
      updateData.maximumStock = Number(maximumStock)
    }
    if (Object.keys(updateData).length > 0) {
      await Stock.updateMany({ productId: id }, updateData)
    }
  }

    return NextResponse.json(product)
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
    await Product.findByIdAndDelete(id)
    await Stock.deleteMany({ productId: id })
    await StockMovement.deleteMany({ productId: id })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}