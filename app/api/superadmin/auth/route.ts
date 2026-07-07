import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (
      email !== process.env.SUPERADMIN_EMAIL ||
      password !== process.env.SUPERADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Cookie de session super admin
    const cookieStore = await cookies()
    cookieStore.set('sa_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 heures
      path: '/',
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('sa_session')
  return NextResponse.json({ ok: true })
}