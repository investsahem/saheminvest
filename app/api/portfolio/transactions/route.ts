import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'all', 'deposits', 'withdrawals', 'investments', 'returns'
    const status = searchParams.get('status') // 'all', 'completed', 'pending', 'failed'
    const dateRange = searchParams.get('dateRange') // '7d', '30d', '90d', '1y', 'all'
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    let whereClause: any = {
      userId: session.user.id
    }

    // Type filter
    if (type && type !== 'all') {
      const typeMapping: { [key: string]: string[] } = {
        'deposits': ['DEPOSIT'],
        'withdrawals': ['WITHDRAWAL'],
        'investments': ['INVESTMENT'],
        'returns': ['RETURN', 'PROFIT_DISTRIBUTION']
      }
      if (typeMapping[type]) {
        whereClause.type = { in: typeMapping[type] }
      }
    }

    // Status filter
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      whereClause.createdAt = { gte: startDate }
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { metadata: { path: ['dealName'], string_contains: search } }
      ]
    }

    // Fetch transactions with related data
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          investment: {
            select: {
              project: {
                select: {
                  id: true,
                  title: true,
                  owner: {
                    select: {
                      id: true,
                      name: true,
                      partnerProfile: {
                        select: {
                          companyName: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.transaction.count({ where: whereClause })
    ])

    // Calculate summary statistics
    const summaryStats = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Process summary stats
    const summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      totalReturns: 0,
      depositCount: 0,
      withdrawalCount: 0,
      investmentCount: 0,
      returnCount: 0
    }

    summaryStats.forEach(stat => {
      const amount = Number(stat._sum.amount || 0)
      const count = stat._count.id

      switch (stat.type) {
        case 'DEPOSIT':
          summary.totalDeposits = amount
          summary.depositCount = count
          break
        case 'WITHDRAWAL':
          summary.totalWithdrawals = Math.abs(amount)
          summary.withdrawalCount = count
          break
        case 'INVESTMENT':
          summary.totalInvestments = Math.abs(amount)
          summary.investmentCount = count
          break
        case 'RETURN':
        case 'PROFIT_DISTRIBUTION':
          summary.totalReturns += amount
          summary.returnCount += count
          break
      }
    })

    // Get user's current wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true }
    })
    const currentWalletBalance = Number(user?.walletBalance || 0)

    // Calculate running balance for each transaction
    // We need to work backwards from current balance
    // For pagination, we need to know the balance at the start of the current page
    // First, get all completed transactions after the current page's transactions to calculate the starting balance

    // Get all completed transactions that happened AFTER the transactions on this page
    // These affect the balance we need to start with
    const laterTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        createdAt: { gt: transactions.length > 0 ? transactions[0].createdAt : new Date() }
      },
      select: { type: true, amount: true }
    })

    // Calculate what the balance was after the first transaction on this page
    let runningBalance = currentWalletBalance

    // Add back the effect of later transactions to get the balance at the top of this page
    laterTransactions.forEach(tx => {
      const amount = Number(tx.amount)
      // Reverse the transaction effect
      if (['DEPOSIT', 'RETURN', 'PROFIT_DISTRIBUTION', 'CAPITAL_RETURN'].includes(tx.type)) {
        runningBalance -= amount // These added to balance, so subtract to go back in time
      } else if (['WITHDRAWAL', 'INVESTMENT'].includes(tx.type)) {
        runningBalance += Math.abs(amount) // These subtracted from balance, so add to go back in time
      }
    })

    // Now calculate balanceAfter for each transaction on this page
    // We iterate forward through the transactions (which are in descending order)
    // So we need to adjust: the first transaction in the list is the most recent
    const transactionsWithBalance = transactions.map((transaction, index) => {
      // The runningBalance represents the balance AFTER this transaction
      const balanceAfter = runningBalance

      // Now adjust runningBalance for the next (older) transaction
      // We reverse this transaction's effect to get the balance before it
      if (transaction.status === 'COMPLETED') {
        const amount = Number(transaction.amount)
        if (['DEPOSIT', 'RETURN', 'PROFIT_DISTRIBUTION', 'CAPITAL_RETURN'].includes(transaction.type)) {
          runningBalance -= amount
        } else if (['WITHDRAWAL', 'INVESTMENT'].includes(transaction.type)) {
          runningBalance += Math.abs(amount)
        }
      }

      return { ...transaction, calculatedBalanceAfter: balanceAfter }
    })

    // Format transactions for frontend
    const formattedTransactions = transactionsWithBalance.map(transaction => ({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: Number(transaction.amount),
      status: transaction.status.toLowerCase(),
      date: transaction.createdAt.toISOString(),
      method: transaction.method || 'wallet',
      description: transaction.description,
      reference: transaction.reference || transaction.id,
      fees: Number((transaction.metadata as any)?.fees || 0),
      balanceAfter: transaction.status.toLowerCase() === 'completed' ? transaction.calculatedBalanceAfter : 0,
      dealId: transaction.investment?.project?.id,
      dealName: transaction.investment?.project?.title,
      partner: transaction.investment?.project?.owner?.partnerProfile?.companyName || transaction.investment?.project?.owner?.name,
      metadata: transaction.metadata || {},
      processingTime: (transaction.metadata as any)?.processingTime || null,
      estimatedCompletion: (transaction.metadata as any)?.estimatedCompletion || null,
      failureReason: (transaction.metadata as any)?.failureReason || null,
      refunded: (transaction.metadata as any)?.refunded || false,
      cardLast4: (transaction.metadata as any)?.cardLast4 || null,
      bankReference: (transaction.metadata as any)?.bankReference || null,
      returnPeriod: (transaction.metadata as any)?.returnPeriod || null
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
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
