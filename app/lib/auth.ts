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
        console.log('🔐 Credentials provider - authorize called', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials', { 
            email: !!credentials?.email, 
            password: !!credentials?.password 
          })
          return null
        }

        try {
          console.log('🔍 Searching for user in database...')
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('👤 Database query result:', user ? { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            hasPassword: !!user.password,
            isActive: user.isActive
          } : 'No user found')

          if (!user) {
            console.log('❌ User not found in database')
            return null
          }

          if (!user.password) {
            console.log('❌ User has no password set')
            return null
          }

          if (!user.isActive) {
            console.log('❌ User account is not active')
            return null
          }

          console.log('🔑 Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔑 Password comparison result:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user.email)
            return null
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }

          console.log('✅ Authorization successful, returning user:', returnUser)
          return returnUser
          
        } catch (error) {
          console.error('❌ Critical error in authorize function:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            email: credentials.email
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log('🔄 JWT callback called', {
        hasUser: !!user,
        hasToken: !!token,
        userRole: user ? (user as any).role : null,
        tokenSub: token?.sub,
        account: account?.provider
      })
      
      // Persist the role in the token right after signin
      if (user) {
        token.role = (user as any).role
        console.log('✅ JWT callback - Setting role in token:', {
          userRole: (user as any).role,
          tokenRole: token.role,
          userId: user.id
        })
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('🔄 Session callback called', {
        hasSession: !!session,
        hasToken: !!token,
        hasUser: !!session?.user,
        tokenRole: token?.role,
        tokenSub: token?.sub
      })
      
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        
        console.log('✅ Session callback - Setting session data:', {
          userId: session.user.id,
          userRole: session.user.role,
          userEmail: session.user.email
        })
      }
      
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle production vs development base URLs
      const productionUrl = 'https://saheminvest.vercel.app'
      const currentBaseUrl = process.env.NODE_ENV === 'production' ? productionUrl : baseUrl
      
      console.log('🔄 Redirect callback:', { url, baseUrl, currentBaseUrl })
      
      // If this is a sign-in redirect, we need to determine the role-based redirect
      if (url === currentBaseUrl || url === baseUrl || url === '/') {
        console.log('🔄 Default redirect - need to determine role-based redirect')
        return `${currentBaseUrl}/portfolio` // Will be handled by middleware
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const fullUrl = `${currentBaseUrl}${url}`
        console.log('✅ Relative URL redirect:', fullUrl)
        return fullUrl
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(currentBaseUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('✅ Same origin redirect:', url)
          return url
        }
      } catch (error) {
        console.error('❌ Error parsing URLs in redirect:', error)
      }
      
      // Default fallback
      const fallbackUrl = `${currentBaseUrl}/portfolio`
      console.log('🔄 Fallback redirect:', fallbackUrl)
      return fallbackUrl
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