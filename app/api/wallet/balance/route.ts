import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/wallet/balance - Get user's wallet balance (calculated from transactions)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        totalInvested: true,
        totalReturns: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate wallet balance from actual transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      }
    })

    let calculatedBalance = 0
    let totalDeposits = 0
    let totalWithdrawals = 0
    let totalInvestments = 0
    let totalReturns = 0

    transactions.forEach(transaction => {
      const amount = Number(transaction.amount)
      
      switch (transaction.type) {
        case 'DEPOSIT':
          calculatedBalance += amount
          totalDeposits += amount
          break
        case 'WITHDRAWAL':
          calculatedBalance -= amount
          totalWithdrawals += amount
          break
        case 'INVESTMENT':
          calculatedBalance -= amount
          totalInvestments += amount
          break
        case 'RETURN':
          calculatedBalance += amount
          totalReturns += amount
          break
      }
    })

    // Update the user's stored balances to match calculated values
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletBalance: calculatedBalance,
        totalInvested: totalInvestments,
        totalReturns: totalReturns
      }
    })

    // Calculate accumulated profits from active investments
    const investmentProfits = await prisma.investment.findMany({
      where: {
        investorId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,

            fundingGoal: true
          }
        }
      }
    })

    // Calculate total accumulated profits
    let accumulatedProfits = 0
    let activeInvestmentValue = 0

    for (const investment of investmentProfits) {
      // Add distributed profits
      // Get distributed profits from transactions
      const profitTransactions = await prisma.transaction.findMany({
        where: {
          investmentId: investment.id,
          type: 'RETURN',
          status: 'COMPLETED'
        }
      })
      
      const distributedProfits = profitTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount), 0
      )
      accumulatedProfits += distributedProfits

      // Calculate current investment value based on project performance
      if (investment.project.status === 'ACTIVE' || investment.project.status === 'FUNDED') {
        const currentProjectValue = Number(investment.project.fundingGoal)
        const investmentRatio = Number(investment.amount) / Number(investment.project.fundingGoal)
        const currentInvestmentValue = currentProjectValue * investmentRatio
        activeInvestmentValue += currentInvestmentValue
      }
    }

    // Update user's totalReturns if there are new profits
    if (accumulatedProfits > Number(user.totalReturns)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalReturns: accumulatedProfits,
          // Optionally add profits to wallet balance (uncomment if you want auto-accumulation)
          // walletBalance: {
          //   increment: accumulatedProfits - Number(user.totalReturns)
          // }
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletBalance: calculatedBalance
      },
      balance: calculatedBalance,
      totalInvested: totalInvestments,
      totalReturns: totalReturns,
      activeInvestmentValue: activeInvestmentValue,
      transactionSummary: {
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        totalInvestments: totalInvestments,
        totalReturns: totalReturns,
        calculatedBalance: calculatedBalance
      },
      profitsSummary: {
        distributedProfits: accumulatedProfits,
        unrealizedGains: Math.max(0, activeInvestmentValue - totalInvestments)
      }
    })

  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet balance' },
      { status: 500 }
    )
  }
}