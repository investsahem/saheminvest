import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing email service...')
    
    // Get email from request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📧 Attempting to send test email to:', email)
    console.log('🔑 Brevo API Key exists:', !!process.env.BREVO_API_KEY)
    console.log('📤 From email:', process.env.FROM_EMAIL)
    
    // Test the email service
    const result = await emailService.sendForgotPasswordEmail(
      email,
      'Test User',
      'test-token-123',
      'https://example.com/reset'
    )
    
    console.log('✅ Email service result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result: result
    })
    
  } catch (error) {
    console.error('❌ Email test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
