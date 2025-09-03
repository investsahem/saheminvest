import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 Testing authorize function manually...')
    console.log('Email:', email)
    console.log('Has password:', !!password)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    console.log('User found:', !!user)
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password
      })
      
      if (user.password) {
        const isValid = await bcrypt.compare(password, user.password)
        console.log('Password valid:', isValid)
        
        return NextResponse.json({
          success: true,
          userFound: true,
          passwordValid: isValid,
          userActive: user.isActive,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      userFound: !!user,
      error: 'Authentication failed'
    })
    
  } catch (error) {
    console.error('Test authorize error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
