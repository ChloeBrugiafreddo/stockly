import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Company from '@/models/Company'
import Role from '@/models/Role'
import Sector from '@/models/Sector'

export async function POST(req: Request) {
  try {
    await connectDB()

    const { firstname, lastname, email, password, companyName, sectorId } = await req.json()

    // Validation basique
    if (!firstname || !lastname || !email || !password || !companyName || !sectorId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Vérifier que le secteur existe
    const sector = await Sector.findById(sectorId)
    if (!sector) {
      return NextResponse.json(
        { error: 'Secteur invalide' },
        { status: 400 }
      )
    }

    // 1. Créer l'entreprise
    const company = await Company.create({
      name: companyName,
      sectorId,
    })

    // 2. Créer le rôle Admin par défaut pour cette entreprise
    const adminRole = await Role.create({
      companyId: company._id,
      name: 'Admin',
      permissions: [
        'stock:read', 'stock:write', 'stock:delete',
        'orders:read', 'orders:write',
        'invoices:read', 'invoices:write',
        'suppliers:read', 'suppliers:write',
        'customers:read', 'customers:write',
        'users:manage',
      ],
    })

    // 3. Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12)

    // 4. Créer l'utilisateur
    const user = await User.create({
      companyId: company._id,
      firstname,
      lastname,
      email,
      passwordHash,
      roleId: adminRole._id,
    })

    return NextResponse.json(
      { message: 'Compte créé avec succès', userId: user._id },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Erreur register:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}