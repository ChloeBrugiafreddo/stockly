import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import mongoose, { Schema } from 'mongoose'

// Modèle inline car pas encore créé
const PurchaseOrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productSku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, default: 0 },
})

const PurchaseOrderSchema = new Schema({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  supplierId:  { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  status:      { type: String, enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'], default: 'DRAFT' },
  items:       [PurchaseOrderItemSchema],
  totalPrice:  { type: Number, default: 0 },
  notes:       { type: String },
  expectedAt:  { type: Date },
  receivedAt:  { type: Date },
}, { timestamps: true })

const PurchaseOrder = mongoose.models.PurchaseOrder ||
  mongoose.model('PurchaseOrder', PurchaseOrderSchema)

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''

    const filter: any = { companyId }
    if (status) filter.status = status

    const orders = await PurchaseOrder.find(filter)
      .populate('supplierId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ items: orders })
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

    const { supplierId, items, notes, expectedAt } = await req.json()

    if (!supplierId || !items?.length) {
      return NextResponse.json({ error: 'Fournisseur et articles requis' }, { status: 400 })
    }

    const totalPrice = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice || 0))
    }, 0)

    const order = await PurchaseOrder.create({
      companyId,
      supplierId,
      items,
      totalPrice,
      notes,
      expectedAt: expectedAt ? new Date(expectedAt) : null,
      status: 'DRAFT',
    })

    return NextResponse.json(order, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}