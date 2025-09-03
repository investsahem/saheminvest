import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password required' 
      }, { status: 400 })
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        debug: { email, userExists: false }
      }, { status: 401 })
    }
    
    // Check if user has a password
    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'User has no password set',
        debug: { 
          email, 
          userExists: true, 
          hasPassword: false 
        }
      }, { status: 401 })
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid password',
        debug: { 
          email, 
          userExists: true, 
          passwordCheck: false,
          userActive: user.isActive 
        }
      }, { status: 401 })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        success: false, 
        error: 'User account is not active',
        debug: { 
          email, 
          userExists: true, 
          passwordCheck: true, 
          userActive: user.isActive 
        }
      }, { status: 401 })
    }
    
    // Success - return user info (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      debug: {
        email,
        userExists: true,
        passwordCheck: true,
        userActive: user.isActive
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
