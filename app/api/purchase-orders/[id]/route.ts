import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import mongoose, { Schema } from 'mongoose'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'
import Warehouse from '@/models/Warehouse'

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const userId = (session.user as any).id
    await connectDB()

    const body = await req.json()

    // Si on passe en RECEIVED → met à jour le stock automatiquement
    if (body.status === 'RECEIVED') {
      const order = await PurchaseOrder.findById(id).lean() as any
      if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

      const warehouse = await Warehouse.findOne({ companyId })
      if (!warehouse) return NextResponse.json({ error: 'Entrepôt introuvable' }, { status: 404 })

      // Pour chaque article — ajoute au stock
      for (const item of order.items) {
        await Stock.updateOne(
          { productId: item.productId, warehouseId: warehouse._id },
          { $inc: { quantity: item.quantity } },
          { upsert: true }
        )

        await StockMovement.create({
          productId: item.productId,
          warehouseId: warehouse._id,
          userId,
          movementType: 'IN',
          quantity: item.quantity,
          reason: `Réception commande fournisseur`,
          referenceId: order._id,
          referenceType: 'purchase_order',
        })
      }

      body.receivedAt = new Date()
    }

    const order = await PurchaseOrder.findByIdAndUpdate(id, body, { new: true })
    return NextResponse.json(order)
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
    const PurchaseOrder = mongoose.models.PurchaseOrder
    await PurchaseOrder.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}