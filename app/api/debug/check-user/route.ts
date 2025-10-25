import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'advisor@sahaminvest.com'
    
    console.log('🔍 Checking user in database:', email)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({
        exists: false,
        message: 'User not found in database',
        email
      })
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    })
    
    // Test password comparison
    const testPassword = 'Azerty@123123'
    let passwordValid = false
    
    if (user.password) {
      passwordValid = await bcrypt.compare(testPassword, user.password)
      console.log('🔑 Password test result:', passwordValid)
    }
    
    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password,
        passwordValid
      },
      message: 'User found in database'
    })
  } catch (error) {
    console.error('❌ Error checking user:', error)
    return NextResponse.json({
      error: 'Failed to check user',
      details: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔧 Creating/updating user:', email)
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password || 'Azerty@123123', 12)
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        email,
        name: email === 'advisor@sahaminvest.com' ? 'Portfolio Advisor' : 'User',
        role: email === 'advisor@sahaminvest.com' ? 'PORTFOLIO_ADVISOR' : 'INVESTOR',
        password: hashedPassword,
        isActive: true
      }
    })
    
    console.log('✅ User created/updated:', {
      id: user.id,
      email: user.email,
      role: user.role
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      message: 'User created/updated successfully'
    })
  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json({
      error: 'Failed to create user',
      details: (error as Error).message
    }, { status: 500 })
  }
}