import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

// GET /api/admin/deposits - Get all deposit requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all deposit transactions with user details
    const deposits = await prisma.transaction.findMany({
      where: {
        type: 'DEPOSIT',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedDeposits = deposits.map(deposit => ({
      id: deposit.id,
      userId: deposit.userId,
      userName: deposit.user.name,
      userEmail: deposit.user.email,
      amount: Number(deposit.amount),
      method: deposit.method,
      status: deposit.status,
      reference: deposit.reference,
      description: deposit.description,
      createdAt: deposit.createdAt.toISOString(),
      updatedAt: deposit.updatedAt.toISOString()
    }))

    return NextResponse.json({
      deposits: formattedDeposits,
      total: deposits.length,
      pending: deposits.filter(d => d.status === 'PENDING').length,
      completed: deposits.filter(d => d.status === 'COMPLETED').length,
      rejected: deposits.filter(d => d.status === 'FAILED').length
    })

  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}
