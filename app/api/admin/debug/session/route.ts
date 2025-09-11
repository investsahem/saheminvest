import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role,
          name: session.user?.name
        },
        expires: session.expires
      } : null,
      hasSession: !!session,
      hasUser: !!session?.user,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN',
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie') ? 'present' : 'missing',
        userAgent: request.headers.get('user-agent')
      },
      url: request.url,
      method: request.method
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Session check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
