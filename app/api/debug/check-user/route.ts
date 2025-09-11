import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })

    return NextResponse.json({
      exists: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        hasResetToken: !!user.resetToken,
        resetTokenExpiry: user.resetTokenExpiry
      } : null
    })

  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
