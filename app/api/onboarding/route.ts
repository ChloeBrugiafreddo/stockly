import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import Customer from '@/models/Customer'
import Supplier from '@/models/Supplier'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    const companyId = (session.user as any).companyId
    await connectDB()

    const user = await User.findById(userId).lean() as any
    if (user?.onboardingDone) {
      return NextResponse.json({ showOnboarding: false })
    }

    // Vérifie ce qui est déjà fait
    const hasProducts  = await Product.exists({ companyId })
    const hasCustomers = await Customer.exists({ companyId })
    const hasSuppliers = await Supplier.exists({ companyId })

    return NextResponse.json({
      showOnboarding: true,
      steps: {
        profile:   true, // compte créé = step 1 fait
        supplier:  !!hasSuppliers,
        product:   !!hasProducts,
        customer:  !!hasCustomers,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    await connectDB()

    await User.findByIdAndUpdate(userId, { onboardingDone: true })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}