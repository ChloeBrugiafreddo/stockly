import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    await connectDB()

    const user = await User.findById(userId)
      .select('-passwordHash')
      .populate('companyId', 'name')
      .lean() as any

    return NextResponse.json({ user })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    await connectDB()

    const { firstname, lastname, email, currentPassword, newPassword } = await req.json()

    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    // Vérifie le mot de passe actuel si on veut en changer
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 })
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, { status: 400 })
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    if (firstname) user.firstname = firstname
    if (lastname) user.lastname = lastname
    if (email) user.email = email

    await user.save()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}