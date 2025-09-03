import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import "../types/auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 15 * 60, // 15 minutes auto-logout
    updateAge: 5 * 60, // Update session every 5 minutes if active
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined,
        maxAge: 15 * 60, // 15 minutes
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Credentials provider - authorize called', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role } : 'No user')

          if (!user || !user.password) {
            console.log('❌ No user or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔑 Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('✅ Authorization successful')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error('❌ Error in authorize:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Send properties to the client - for database sessions, user comes from database
      if (user && session.user) {
        session.user.id = user.id
        session.user.role = (user as any).role
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Session callback - User role:', (user as any).role, 'Session role:', session.user.role)
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle production vs development base URLs
      const productionUrl = 'https://saheminvest.vercel.app'
      const currentBaseUrl = process.env.NODE_ENV === 'production' ? productionUrl : baseUrl
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${currentBaseUrl}${url}`
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(currentBaseUrl)
        if (urlObj.origin === baseUrlObj.origin) return url
      } catch (error) {
        console.error('Error parsing URLs in redirect:', error)
      }
      
      // Default fallback
      return currentBaseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  events: {
    async signIn(message) {
      console.log('SignIn event:', message.user?.email, message.user?.role)
    },
    async session(message) {
      console.log('Session event:', message.session?.user?.email, message.session?.user?.role)
    }
  },
  debug: process.env.NODE_ENV === "development",
}

export default authOptions 