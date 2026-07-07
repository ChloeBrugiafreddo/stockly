import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Role from '@/models/Role'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    const currentUserId = (session.user as any).id
    await connectDB()

    if (id === currentUserId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    if (user.companyId.toString() !== companyId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await User.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const { roleName } = await req.json()

    const user = await User.findById(id)
    if (!user || user.companyId.toString() !== companyId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const role = await Role.findOne({ companyId, name: roleName })
    if (!role) return NextResponse.json({ error: 'Rôle introuvable' }, { status: 404 })

    await User.findByIdAndUpdate(id, { roleId: role._id })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}