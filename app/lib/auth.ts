import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import "../types/auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
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
        maxAge: 15 * 60, // 15 minutes
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
    async jwt({ token, user, account, profile }) {
      // Persist the role in the token right after signin
      if (user) {
        token.role = (user as any).role
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback - User role:', (user as any).role, 'Token role:', token.role)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Session callback - Token role:', token.role, 'Session role:', session.user.role)
        }
      }
      return session
    },
    async redirect({ url, baseUrl, token }) {
      // Handle production vs development base URLs
      const productionUrl = 'https://saheminvest.vercel.app'
      const currentBaseUrl = process.env.NODE_ENV === 'production' ? productionUrl : baseUrl
      
      console.log('🔄 Redirect callback:', { url, token: token ? { role: token.role, email: token.email } : null })
      
      // If user has a role, redirect based on role
      if (token?.role) {
        const userRole = token.role as string
        let roleBasedUrl = '/portfolio' // default
        
        switch (userRole) {
          case 'ADMIN':
            roleBasedUrl = '/admin'
            break
          case 'DEAL_MANAGER':
            roleBasedUrl = '/deal-manager'
            break
          case 'FINANCIAL_OFFICER':
            roleBasedUrl = '/financial-officer'
            break
          case 'PORTFOLIO_ADVISOR':
            roleBasedUrl = '/portfolio-advisor'
            break
          case 'PARTNER':
            roleBasedUrl = '/partner/dashboard'
            break
          case 'INVESTOR':
          default:
            roleBasedUrl = '/portfolio'
            break
        }
        
        console.log('✅ Role-based redirect:', { role: userRole, redirectTo: roleBasedUrl })
        return `${currentBaseUrl}${roleBasedUrl}`
      }
      
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
      return `${currentBaseUrl}/portfolio`
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
    async signOut(message) {
      console.log('SignOut event: Session cleared')
    },
    async session(message) {
      console.log('Session event:', message.session?.user?.email, message.session?.user?.role)
    }
  },
  debug: process.env.NODE_ENV === "development",
}

export default authOptions 