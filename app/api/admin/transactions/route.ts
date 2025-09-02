import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'READ_TRANSACTIONS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get transactions with user and investment details
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          investment: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    // Transform transactions to match frontend interface
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: Number(transaction.amount),
      status: transaction.status.toLowerCase(),
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        role: transaction.user.role
      },
      deal: transaction.investment?.project ? {
        id: transaction.investment.project.id,
        title: transaction.investment.project.title
      } : undefined,
      description: transaction.description,
      reference: transaction.reference,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      method: transaction.method || undefined
    }))

    // Calculate statistics from all transactions (not just current page)
    const allTransactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
        status: true
      }
    })

    const statistics = {
      totalDeposits: allTransactions
        .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalWithdrawals: allTransactions
        .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalInvestments: allTransactions
        .filter(t => t.type === 'INVESTMENT' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalReturns: allTransactions
        .filter(t => t.type === 'RETURN' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalFees: allTransactions
        .filter(t => t.type === 'FEE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalCommissions: allTransactions
        .filter(t => t.type === 'COMMISSION' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      pendingCount: allTransactions.filter(t => t.status === 'PENDING').length,
      completedCount: allTransactions.filter(t => t.status === 'COMPLETED').length,
      failedCount: allTransactions.filter(t => t.status === 'FAILED').length,
      totalVolume: allTransactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    return NextResponse.json({
      transactions: transformedTransactions,
      statistics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/transactions - Create manual transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'WRITE_TRANSACTIONS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, type, amount, description, method } = body

    // Generate reference
    const reference = `${type.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: type.toUpperCase(),
        amount,
        description,
        reference,
        method: method || null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: Number(transaction.amount),
      status: transaction.status.toLowerCase(),
      user: transaction.user,
      description: transaction.description,
      reference: transaction.reference,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      method: transaction.method || undefined
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}