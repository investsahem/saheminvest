import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow debug pages without authentication
  if (pathname.startsWith("/debug")) {
    return NextResponse.next()
  }
  
  // Allow auth pages
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  
  // Allow public pages
  if (pathname === "/" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/public")) {
    return NextResponse.next()
  }
  
  // Check for session using database strategy
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    // For database sessions, we need to check differently
  })
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', pathname, 'Token:', token ? { role: token.role, email: token.email } : 'No token')
  }
  
  // If no token, redirect to sign-in
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  const userRole = token.role as string
  
  // Route-based authorization
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  if (pathname.startsWith("/deal-manager") && !["DEAL_MANAGER", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  if (pathname.startsWith("/financial-officer") && !["FINANCIAL_OFFICER", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  if (pathname.startsWith("/portfolio-advisor") && !["PORTFOLIO_ADVISOR", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  if (pathname.startsWith("/portfolio") && !["INVESTOR", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  if (pathname.startsWith("/partner") && !["PARTNER", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*",
    "/deal-manager/:path*",
    "/financial-officer/:path*",
    "/portfolio-advisor/:path*",
    "/portfolio/:path*", 
    "/deals/:path*",
    "/partner/:path*",
    "/api/((?!auth|public).)*"
  ]
} 