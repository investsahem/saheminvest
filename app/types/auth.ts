import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
  }
}

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: string
} 