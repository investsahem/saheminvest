import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/wallet/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // 'all', 'deposit', 'withdrawal', 'investment', 'return', 'fee'
    const skip = (page - 1) * limit

    // Build filter conditions
    const whereClause: any = {
      userId: session.user.id
    }
    
    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase()
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          investment: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ])

    // Format transactions for frontend
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: Number(transaction.amount),
      description: transaction.description,
      status: transaction.status.toLowerCase(),
      createdAt: transaction.createdAt.toISOString(),
      reference: transaction.reference,
      method: transaction.method,
      projectTitle: transaction.investment?.project?.title || null,
      projectCategory: transaction.investment?.project?.category || null
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}


