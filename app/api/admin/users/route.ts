import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - Get all users for admin management
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const whereClause: any = {}
    if (role && role !== 'all') {
      whereClause.role = role.toUpperCase()
    }

    // Fetch users with basic info
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletBalance: true,
        totalInvested: true,
        totalReturns: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            investments: true,
            transactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause
    })

    // Format the response to match frontend User interface
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(), // Using updatedAt as lastLogin for now
      permissions: [], // Will be populated on frontend based on role
      // Additional info
      walletBalance: Number(user.walletBalance),
      totalInvested: Number(user.totalInvested),
      totalReturns: Number(user.totalReturns),
      investmentCount: user._count.investments,
      transactionCount: user._count.transactions
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: totalUsers,
      limit,
      offset,
      hasMore: offset + limit < totalUsers
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, role, password } = await request.json()

    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Name, email, role, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        isActive: true,
        walletBalance: 0,
        totalInvested: 0,
        totalReturns: 0
      }
    })

    // Format response
    const formattedUser = {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: null,
      permissions: []
    }

    return NextResponse.json({
      user: formattedUser,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
