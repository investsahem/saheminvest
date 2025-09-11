import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    environment: {
      BREVO_API_KEY: process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing',
      FROM_EMAIL: process.env.FROM_EMAIL || '❌ Missing',
      SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing'
    },
    timestamp: new Date().toISOString()
  })
}