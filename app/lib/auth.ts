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
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.saheminvest.vercel.app' : undefined,
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
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
  session: {
    strategy: "jwt",
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