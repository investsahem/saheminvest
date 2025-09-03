import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
      NEXTAUTH_SECRET_FIRST_10: process.env.NEXTAUTH_SECRET?.substring(0, 10) || 'missing',
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    }
  })
}
