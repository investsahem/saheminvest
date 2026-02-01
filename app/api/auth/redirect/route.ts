import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Role-based redirect API called')

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token?.role) {
      console.log('❌ No token or role found, redirecting to sign-in')
      const baseUrl = process.env.NEXTAUTH_URL || 'https://saheminvest.com'
      return NextResponse.redirect(new URL('/auth/signin', baseUrl))
    }

    const userRole = token.role as string
    let redirectPath = '/portfolio' // default

    switch (userRole) {
      case 'ADMIN':
        redirectPath = '/admin'
        break
      case 'DEAL_MANAGER':
        redirectPath = '/deal-manager'
        break
      case 'FINANCIAL_OFFICER':
        redirectPath = '/financial-officer'
        break
      case 'PORTFOLIO_ADVISOR':
        redirectPath = '/portfolio-advisor'
        break
      case 'PARTNER':
        redirectPath = '/partner/dashboard'
        break
      case 'INVESTOR':
      default:
        redirectPath = '/portfolio'
        break
    }

    // Use NEXTAUTH_URL as base to ensure correct domain
    const baseUrl = process.env.NEXTAUTH_URL || 'https://saheminvest.com'
    console.log('✅ Role-based redirect:', { role: userRole, redirectTo: redirectPath, baseUrl })
    return NextResponse.redirect(new URL(redirectPath, baseUrl))

  } catch (error) {
    console.error('❌ Error in role-based redirect:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://saheminvest.com'
    return NextResponse.redirect(new URL('/portfolio', baseUrl))
  }
}
