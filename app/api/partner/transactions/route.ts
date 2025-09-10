import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '6months'
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Build where conditions
    const whereConditions: any = {
      userId: session.user.id,
      createdAt: {
        gte: startDate
      }
    }

    if (type !== 'all') {
      whereConditions.type = type
    }

    if (status !== 'all') {
      whereConditions.status = status
    }

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where: whereConditions,
      include: {
        investment: {
          include: {
            project: {
              select: {
                title: true,
                id: true
              }
            },
            investor: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereConditions
    })

    // Calculate summary metrics
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        }
      }
    })

    const completedTransactions = allTransactions.filter(t => t.status === 'COMPLETED')
    
    const totalIncome = completedTransactions
      .filter(t => ['COMMISSION', 'RETURN', 'DEPOSIT'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalOutgoing = completedTransactions
      .filter(t => ['WITHDRAWAL', 'FEE'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    const pendingAmount = allTransactions
      .filter(t => t.status === 'PENDING')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    const netBalance = totalIncome - totalOutgoing

    // Calculate monthly growth (simplified - you might want more sophisticated logic)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const thisMonthTransactions = completedTransactions.filter(t => 
      new Date(t.createdAt) >= thisMonth
    )
    const lastMonthTransactions = completedTransactions.filter(t => 
      new Date(t.createdAt) >= lastMonth && new Date(t.createdAt) < thisMonth
    )

    const thisMonthIncome = thisMonthTransactions
      .filter(t => ['COMMISSION', 'RETURN', 'DEPOSIT'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const lastMonthIncome = lastMonthTransactions
      .filter(t => ['COMMISSION', 'RETURN', 'DEPOSIT'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const incomeGrowth = lastMonthIncome > 0 
      ? Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 * 100) / 100
      : 0

    const thisMonthOutgoing = thisMonthTransactions
      .filter(t => ['WITHDRAWAL', 'FEE'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
    
    const lastMonthOutgoing = lastMonthTransactions
      .filter(t => ['WITHDRAWAL', 'FEE'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    const outgoingGrowth = lastMonthOutgoing > 0 
      ? Math.round(((thisMonthOutgoing - lastMonthOutgoing) / lastMonthOutgoing) * 100 * 100) / 100
      : 0

    const thisMonthNet = thisMonthIncome - thisMonthOutgoing
    const lastMonthNet = lastMonthIncome - lastMonthOutgoing
    const netGrowth = lastMonthNet > 0 
      ? Math.round(((thisMonthNet - lastMonthNet) / lastMonthNet) * 100 * 100) / 100
      : 0

    // Format transactions for response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      status: transaction.status,
      date: transaction.createdAt.toISOString(),
      description: transaction.description || generateTransactionDescription(transaction),
      dealTitle: transaction.investment?.project?.title,
      investorName: transaction.investment?.investor?.name,
      reference: transaction.reference || `${transaction.type}-${transaction.createdAt.getFullYear()}-${transaction.id.slice(-3).toUpperCase()}`,
      method: transaction.method || 'Bank Transfer'
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      summary: {
        totalIncome,
        totalOutgoing,
        pendingAmount,
        netBalance,
        growth: {
          income: incomeGrowth,
          outgoing: outgoingGrowth,
          net: netGrowth
        }
      }
    })

  } catch (error) {
    console.error('Error fetching partner transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

function generateTransactionDescription(transaction: any): string {
  const type = transaction.type
  const dealTitle = transaction.investment?.project?.title
  const investorName = transaction.investment?.investor?.name
  
  switch (type) {
    case 'COMMISSION':
      return `Commission from ${dealTitle || 'investment deal'}${investorName ? ` - ${investorName}` : ''}`
    case 'RETURN':
      return `Return payment to investors${dealTitle ? ` - ${dealTitle}` : ''}`
    case 'FEE':
      return 'Platform fee for deal management'
    case 'DEPOSIT':
      return 'Deposit to partner account'
    case 'WITHDRAWAL':
      return 'Withdrawal from partner account'
    case 'INVESTMENT':
      return `Investment in ${dealTitle || 'deal'}`
    default:
      return 'Transaction'
  }
}
