import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { emailService } from '../../../lib/email'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // We'll need to add these fields to the User model
        resetToken,
        resetTokenExpiry
      }
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send email
    try {
      console.log('📧 Attempting to send forgot password email to:', user.email)
      const emailResult = await emailService.sendForgotPasswordEmail(
        user.email,
        user.name || 'User',
        resetToken,
        resetUrl
      )
      
      console.log('📧 Email service result:', emailResult)
      
      if (emailResult && emailResult.success) {
        console.log(`✅ Password reset email sent successfully to ${user.email}`)
      } else {
        console.error('❌ Email service returned failure:', emailResult)
      }
    } catch (emailError) {
      console.error('💥 Failed to send reset email (exception):', emailError)
      // Don't reveal email sending failure to prevent enumeration
      // But log it for admin monitoring
      console.error('📊 Email service error details:', {
        email: user.email,
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}