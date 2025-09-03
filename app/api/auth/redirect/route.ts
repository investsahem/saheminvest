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
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    const userRole = token.role as string
    let redirectUrl = '/portfolio' // default
    
    switch (userRole) {
      case 'ADMIN':
        redirectUrl = '/admin'
        break
      case 'DEAL_MANAGER':
        redirectUrl = '/deal-manager'
        break
      case 'FINANCIAL_OFFICER':
        redirectUrl = '/financial-officer'
        break
      case 'PORTFOLIO_ADVISOR':
        redirectUrl = '/portfolio-advisor'
        break
      case 'PARTNER':
        redirectUrl = '/partner/dashboard'
        break
      case 'INVESTOR':
      default:
        redirectUrl = '/portfolio'
        break
    }
    
    console.log('✅ Role-based redirect:', { role: userRole, redirectTo: redirectUrl })
    return NextResponse.redirect(new URL(redirectUrl, request.url))
    
  } catch (error) {
    console.error('❌ Error in role-based redirect:', error)
    return NextResponse.redirect(new URL('/portfolio', request.url))
  }
}
