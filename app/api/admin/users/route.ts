import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

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

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: Number(user.walletBalance),
      totalInvested: Number(user.totalInvested),
      totalReturns: Number(user.totalReturns),
      isActive: user.isActive,
      investmentCount: user._count.investments,
      transactionCount: user._count.transactions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
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


