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
    let actualProfitReturns = 0

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
          // Only count actual profit returns, not capital returns
          if (!transaction.description?.includes('Capital return') && !transaction.description?.includes('capital return')) {
            actualProfitReturns += amount
          }
          break
        case 'PROFIT_DISTRIBUTION':
          calculatedBalance += amount
          actualProfitReturns += amount
          break
      }
    })

    // Update the user's stored balances to match calculated values
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletBalance: calculatedBalance,
        totalInvested: totalInvestments,
        totalReturns: actualProfitReturns
      }
    })

    // Calculate accumulated profits and actual investments from investment records
    const investmentRecords = await prisma.investment.findMany({
      where: {
        investorId: session.user.id
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

    // Calculate total accumulated profits and actual total invested
    let accumulatedProfits = 0
    let activeInvestmentValue = 0
    let actualTotalInvested = 0

    for (const investment of investmentRecords) {
      // Add to actual total invested from investment records (not transactions)
      actualTotalInvested += Number(investment.amount)

      // Add distributed profits
      // Get distributed profits from transactions (both RETURN and PROFIT_DISTRIBUTION types)
      const profitTransactions = await prisma.transaction.findMany({
        where: {
          investmentId: investment.id,
          type: { in: ['RETURN', 'PROFIT_DISTRIBUTION'] },
          status: 'COMPLETED',
          AND: [
            { description: { not: { contains: 'Capital return' } } },
            { description: { not: { contains: 'capital return' } } }
          ]
        }
      })
      
      const distributedProfits = profitTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount), 0
      )
      accumulatedProfits += distributedProfits

      // Calculate current investment value based on project performance
      if (investment.project.status === 'COMPLETED') {
        // For completed investments, don't count towards active investments
        // The capital should have been returned to wallet
      } else if (investment.project.status === 'ACTIVE' || investment.project.status === 'FUNDED') {
        // For active/funded investments, use the investment amount as current value
        activeInvestmentValue += Number(investment.amount)
      }
    }

    // For completed investments, we need to add back the original investment to the wallet
    // This simulates the capital being "returned" when the deal completes
    let completedInvestmentReturns = 0
    for (const investment of investmentRecords) {
      if (investment.project.status === 'COMPLETED') {
        // Check if we've already added this completed investment back to the wallet
        const hasCapitalReturn = await prisma.transaction.findFirst({
          where: {
            userId: session.user.id,
            investmentId: investment.id,
            type: 'RETURN',
            description: { contains: 'Capital Return' }
          }
        })
        
        if (!hasCapitalReturn) {
          // Create a capital return transaction for the completed investment
          await prisma.transaction.create({
            data: {
              userId: session.user.id,
              investmentId: investment.id,
              type: 'RETURN',
              amount: Number(investment.amount),
              description: `Capital Return - ${investment.project.title}`,
              status: 'COMPLETED',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          completedInvestmentReturns += Number(investment.amount)
        }
      }
    }

    // Recalculate balance if we added capital returns
    if (completedInvestmentReturns > 0) {
      calculatedBalance += completedInvestmentReturns
      // Don't add capital returns to profit returns - they're just returned capital
    }

    // Update user's wallet balance and investment totals
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalReturns: accumulatedProfits, // Use actual distributed profits
        walletBalance: calculatedBalance,
        totalInvested: actualTotalInvested // Use actual investments from records
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletBalance: calculatedBalance
      },
      balance: calculatedBalance,
      totalInvested: actualTotalInvested, // Use actual investments from investment records
      totalReturns: accumulatedProfits, // Use accumulated profits from investment records
      activeInvestmentValue: activeInvestmentValue,
      transactionSummary: {
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        totalInvestments: totalInvestments, // From transactions
        actualTotalInvested: actualTotalInvested, // From investment records
        totalReturns: actualProfitReturns,
        calculatedBalance: calculatedBalance
      },
      profitsSummary: {
        distributedProfits: accumulatedProfits, // Actual distributed profits
        unrealizedGains: 0 // For now, set to 0 - can be calculated based on expected returns later
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