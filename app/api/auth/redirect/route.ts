import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import authOptions from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Role-based redirect API called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role) {
      console.log('❌ No session or role found, redirecting to sign-in')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    const userRole = session.user.role
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
