import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// PATCH /api/admin/users/[id]/role - Update user role
export async function PATCH(
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
    const { role } = await request.json()

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const validRoles = ['ADMIN', 'DEAL_MANAGER', 'FINANCIAL_OFFICER', 'PORTFOLIO_ADVISOR', 'INVESTOR', 'PARTNER']
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Don't allow changing own role to non-admin
    if (id === session.user.id && role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() }
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
