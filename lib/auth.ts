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

        // Récupère le nom du secteur
        const Company = (await import('@/models/Company')).default
        const Sector = (await import('@/models/Sector')).default
        const company = await Company.findById(user.companyId)
        const sector = company?.sectorId ? await Sector.findById(company.sectorId) : null

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          companyId: user.companyId.toString(),
          role: user.roleId?.toString(),
          domain: sector?.name || '',
        }
      },
    })
  ],
  callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.companyId = (user as any).companyId
          token.role = (user as any).role
          token.domain = (user as any).domain
        }
        return token
      },
      session({ session, token }) {
        (session.user as any).id = token.id
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).role = token.role
        ;(session.user as any).domain = token.domain
        return session
      }
    },
  pages: {
    signIn: '/login',
  }
})