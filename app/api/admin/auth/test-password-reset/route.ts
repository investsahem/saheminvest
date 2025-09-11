import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import crypto from 'crypto'
import { emailService } from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate test reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send test email
    await emailService.sendForgotPasswordEmail(
      user.email,
      user.name || 'User',
      resetToken,
      resetUrl
    )

    return NextResponse.json({ 
      success: true, 
      message: `Test password reset email sent to ${email}`,
      resetUrl: resetUrl,
      tokenExpiry: resetTokenExpiry.toISOString()
    })

  } catch (error) {
    console.error('Test password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to send test password reset email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get password reset statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats about password resets
    const totalUsers = await prisma.user.count()
    
    const activeResetTokens = await prisma.user.count({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { gt: new Date() }
      }
    })

    const expiredResetTokens = await prisma.user.count({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { lte: new Date() }
      }
    })

    const recentResets = await prisma.user.findMany({
      where: {
        OR: [
          { resetToken: { not: null } },
          { resetTokenExpiry: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        resetTokenExpiry: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        activeResetTokens,
        expiredResetTokens,
        recentResets: recentResets.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          tokenExpiry: user.resetTokenExpiry,
          lastUpdated: user.updatedAt,
          tokenStatus: user.resetTokenExpiry && user.resetTokenExpiry > new Date() ? 'active' : 'expired'
        }))
      }
    })

  } catch (error) {
    console.error('Password reset stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get password reset statistics' },
      { status: 500 }
    )
  }
}
