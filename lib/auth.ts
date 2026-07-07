import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import User from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null
        const ok = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!ok) return null

        const Company = (await import('@/models/Company')).default
        const Sector = (await import('@/models/Sector')).default
        const Role = (await import('@/models/Role')).default

        const company = await Company.findById(user.companyId)
        const sector = company?.sectorId ? await Sector.findById(company.sectorId) : null
        const role = user.roleId ? await Role.findById(user.roleId) : null

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          companyId: user.companyId.toString(),
          role: user.roleId?.toString(),
          roleName: role?.name || 'Employé',
          domain: sector?.name || '',
        }
      },
    })
  ],
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.companyId = (user as any).companyId
        token.role = (user as any).role
        token.roleName = (user as any).roleName
        token.domain = (user as any).domain
      }
      return token
    },
    session({ session, token }) {
      (session.user as any).id = token.id
      ;(session.user as any).companyId = token.companyId
      ;(session.user as any).role = token.role
      ;(session.user as any).roleName = token.roleName
      ;(session.user as any).domain = token.domain
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})