import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Role from '@/models/Role'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const companyId = (session.user as any).companyId
    await connectDB()

    const users = await User.find({ companyId })
      .select('-passwordHash')
      .populate('roleId', 'name permissions')
      .lean()

    return NextResponse.json({ users })
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

    const { firstname, lastname, email, password, roleName } = await req.json()

    if (!firstname || !lastname || !email || !password || !roleName) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const permissions: Record<string, string[]> = {
      Admin: [
        'stock:read', 'stock:write', 'stock:delete',
        'productions:read', 'productions:write',
        'customers:read', 'customers:write',
        'suppliers:read', 'suppliers:write',
        'invoices:read', 'invoices:write',
        'users:manage', 'settings:manage',
      ],
      Manager: [
        'stock:read', 'stock:write',
        'productions:read', 'productions:write',
        'customers:read', 'customers:write',
        'suppliers:read', 'suppliers:write',
        'invoices:read', 'invoices:write',
      ],
      'Employé': [
        'stock:read', 'stock:write',
        'productions:read', 'productions:write',
      ],
    }

    let role = await Role.findOne({ companyId, name: roleName })
    if (!role) {
      role = await Role.create({
        companyId,
        name: roleName,
        permissions: permissions[roleName] || permissions['Employé'],
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      companyId,
      firstname,
      lastname,
      email,
      passwordHash,
      roleId: role._id,
    })

    return NextResponse.json({ ok: true, userId: user._id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}