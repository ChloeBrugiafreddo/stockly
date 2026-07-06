import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Stock from '@/models/Stock'
import StockMovement from '@/models/StockMovement'
import Production from '@/models/Production'
import Invoice from '@/models/Invoice'
import Supplier from '@/models/Supplier'
import CustomFieldValue from '@/models/CustomFieldValue'
import CustomField from '@/models/CustomField'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    await connectDB()

    // 1. Produit + stock
    const product = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name email phone')
      .lean() as any

    if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })

    const stock = await Stock.findOne({ productId: id }).lean() as any

    // 2. Tous les mouvements
    const movements = await StockMovement.find({ productId: id })
      .sort({ createdAt: -1 })
      .lean()

    // 3. Productions qui ont utilisé ce produit
    const productions = await Production.find({
      'components.productId': id,
    }).lean()

    const productionsWithQty = productions.map((p: any) => {
      const component = p.components.find(
        (c: any) => c.productId.toString() === id
      )
      return {
        _id: p._id,
        ref: p.ref,
        name: p.name,
        status: p.status,
        quantity: component?.quantity || 0,
        addedAt: component?.addedAt,
        addedBy: component?.addedBy,
      }
    })

    // 4. Factures qui référencent ce produit
    const invoicesWithProduct = await Invoice.find({
      companyId: product.companyId,
      'items.description': { $regex: product.name, $options: 'i' },
    }).lean()

    // 5. Champs custom et leurs valeurs
    const customValues = await CustomFieldValue.find({ entityId: id }).lean() as any[]
    const customFieldIds = customValues.map(v => v.customFieldId)
    const customFields = await CustomField.find({ _id: { $in: customFieldIds } }).lean() as any[]

    const enrichedCustomValues = customValues.map(v => {
      const field = customFields.find(f => f._id.toString() === v.customFieldId.toString())
      return {
        label: field?.fieldLabel || v.customFieldId,
        value: v.value,
        type: field?.fieldType || 'text',
      }
    })

    // 6. Stats rapides
    const totalIn = movements
      .filter((m: any) => m.movementType === 'IN')
      .reduce((sum: number, m: any) => sum + m.quantity, 0)

    const totalOut = movements
      .filter((m: any) => m.movementType === 'OUT')
      .reduce((sum: number, m: any) => sum + m.quantity, 0)

    return NextResponse.json({
      product,
      stock,
      movements,
      productions: productionsWithQty,
      invoices: invoicesWithProduct,
      customValues: enrichedCustomValues,
      stats: {
        totalIn,
        totalOut,
        totalMovements: movements.length,
        usedInProductions: productionsWithQty.length,
      },
    })
  } catch (e: any) {
    console.error('Identity error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}