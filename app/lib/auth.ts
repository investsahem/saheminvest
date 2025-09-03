import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import "../types/auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
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
  trustHost: true,
}

export default authOptions 