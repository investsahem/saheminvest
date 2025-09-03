import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import authOptions from '@/app/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if we can get a session
    const session = await getServerSession(authOptions)
    
    // Test 2: Check database connection
    let dbStatus = 'unknown'
    let userCount = 0
    let testUser = null
    
    try {
      userCount = await prisma.user.count()
      testUser = await prisma.user.findUnique({
        where: { email: 'investor@sahaminvest.com' },
        select: { id: true, email: true, role: true, name: true }
      })
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : 'unknown'}`
    }
    
    // Test 3: Check environment variables
    const envCheck = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL, // For debugging
    }
    
    // Test 4: Check request headers
    const headers = {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      cookie: request.headers.get('cookie') ? 'present' : 'missing'
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      database: {
        status: dbStatus,
        userCount,
        testUser
      },
      environment: envCheck,
      request: headers,
      url: request.url
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
