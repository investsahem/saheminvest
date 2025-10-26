import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import * as bcrypt from "bcryptjs"
import { prisma } from "./db"
import "../types/auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
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
            needsPasswordChange: user.needsPasswordChange,
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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔄 SignIn callback called', {
        provider: account?.provider,
        userEmail: user?.email,
        hasProfile: !!profile
      })

      // Handle Google OAuth signin/signup
      if (account?.provider === "google" && user?.email) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (existingUser) {
            console.log('✅ Google OAuth - Existing user found:', existingUser.email)
            // Update user info from Google if needed
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                lastLoginAt: new Date()
              }
            })
            return true
          } else {
            console.log('🆕 Google OAuth - Creating new user:', user.email)
            // Create new user from Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image,
                role: 'INVESTOR', // Default role for Google OAuth users
                isActive: true,
                emailVerified: new Date(), // Google emails are pre-verified
                createdAt: new Date(),
                lastLoginAt: new Date()
              }
            })
            console.log('✅ Google OAuth - New user created:', newUser.id)
            return true
          }
        } catch (error) {
          console.error('❌ Google OAuth error:', error)
          return false
        }
      }

      // For credentials provider, allow through (handled in authorize)
      if (account?.provider === "credentials") {
        return true
      }

      return true
    },
    async jwt({ token, user, account, profile }) {
      console.log('🔄 JWT callback called', {
        hasUser: !!user,
        hasToken: !!token,
        userRole: user ? (user as any).role : null,
        tokenSub: token?.sub,
        account: account?.provider
      })
      
      // For Google OAuth, fetch user data from database
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.needsPasswordChange = dbUser.needsPasswordChange || false
          token.id = dbUser.id
        }
      }
      
      // Persist the role and password change flag in the token right after signin
      if (user) {
        token.role = (user as any).role || token.role
        token.needsPasswordChange = (user as any).needsPasswordChange || token.needsPasswordChange
        token.id = (user as any).id || token.id
        console.log('✅ JWT callback - Setting user data in token:', {
          userRole: token.role,
          needsPasswordChange: token.needsPasswordChange,
          userId: token.id
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
        session.user.needsPasswordChange = token.needsPasswordChange as boolean
        
        console.log('✅ Session callback - Setting session data:', {
          userId: session.user.id,
          userRole: session.user.role,
          needsPasswordChange: session.user.needsPasswordChange,
          userEmail: session.user.email
        })
      }
      
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl })
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log('✅ Relative URL redirect:', `${baseUrl}${url}`)
        return `${baseUrl}${url}`
      }
      
      // Allows callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        console.log('✅ Same origin redirect:', url)
        return url
      }
      
      // Default fallback
      console.log('🔄 Fallback redirect to portfolio')
      return `${baseUrl}/portfolio`
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  debug: process.env.NODE_ENV === "development",
}

export default authOptions 