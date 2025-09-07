import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        walletBalance: true,
        totalInvested: true,
        totalReturns: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            investments: true,
            transactions: true,
            projects: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const formattedUser = {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
      permissions: [],
      walletBalance: Number(user.walletBalance),
      totalInvested: Number(user.totalInvested),
      totalReturns: Number(user.totalReturns),
      investmentCount: user._count.investments,
      transactionCount: user._count.transactions,
      projectCount: user._count.projects
    }

    return NextResponse.json({ user: formattedUser })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user (soft delete by deactivating)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Don't allow deleting self
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Soft delete by deactivating user
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
}
