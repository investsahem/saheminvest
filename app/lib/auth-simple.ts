import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 SIMPLE AUTH - authorize called', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ SIMPLE AUTH - Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('👤 SIMPLE AUTH - User found:', !!user)

          if (!user || !user.password || !user.isActive) {
            console.log('❌ SIMPLE AUTH - User invalid')
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 SIMPLE AUTH - Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ SIMPLE AUTH - Invalid password')
            return null
          }

          console.log('✅ SIMPLE AUTH - Success!')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            needsPasswordChange: user.needsPasswordChange,
          }
          
        } catch (error) {
          console.error('❌ SIMPLE AUTH - Error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.needsPasswordChange = (user as any).needsPasswordChange
        console.log('✅ SIMPLE AUTH - JWT callback:', { role: token.role, needsPasswordChange: token.needsPasswordChange })
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.needsPasswordChange = token.needsPasswordChange as boolean
        console.log('✅ SIMPLE AUTH - Session callback:', { role: session.user.role, needsPasswordChange: session.user.needsPasswordChange })
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export default authOptions
