import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/portfolio/overview - Get investor's portfolio overview
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's investments with project details
    const investments = await prisma.investment.findMany({
      where: {
        investorId: session.user.id
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            thumbnailImage: true,
            fundingGoal: true,
            currentFunding: true,

            expectedReturn: true,
            duration: true,
            endDate: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        investmentDate: 'desc'
      }
    })

    // Calculate portfolio metrics
    let totalInvested = 0 // Only count active investments
    let totalHistoricalInvested = 0 // All investments ever made (for return calculations)
    let currentPortfolioValue = 0
    let totalReturns = 0
    let totalDistributedProfits = 0
    const portfolioInvestments = []

    // Get yesterday's portfolio value for daily change calculation
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    for (const investment of investments) {
      const investedAmount = Number(investment.amount)
      totalHistoricalInvested += investedAmount
      
      // Only count as "currently invested" if not completed
      if (investment.project.status !== 'COMPLETED') {
        totalInvested += investedAmount
      }

      // Get distributed profits from transactions (excluding capital returns)
      const profitTransactions = await prisma.transaction.findMany({
        where: {
          investmentId: investment.id,
          type: 'RETURN',
          status: 'COMPLETED',
          description: { not: { contains: 'Capital Return' } } // Exclude capital returns
        }
      })
      
      const distributedProfits = profitTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount), 0
      )

      // Calculate current value based on project performance
      let currentValue = investedAmount
      const project = investment.project

      if (project.status === 'COMPLETED') {
        // For completed projects, the value includes distributed profits
        // The original investment capital is returned to wallet balance
        currentValue = distributedProfits
      } else if (project.status === 'FUNDED') {
        // For funded projects, current value = investment + any distributed profits
        currentValue = investedAmount + distributedProfits
      } else if (project.status === 'ACTIVE') {
        // For active projects, estimate based on expected return and progress + any distributed profits
        const fundingProgress = Number(project.currentFunding) / Number(project.fundingGoal)
        const timeProgress = project.endDate ? 
          Math.min(1, (Date.now() - new Date(project.createdAt).getTime()) / 
          (new Date(project.endDate).getTime() - new Date(project.createdAt).getTime())) : 0
        
        // Conservative estimation: partial expected return based on time progress
        const estimatedReturn = investedAmount * (Number(project.expectedReturn) / 100) * timeProgress * 0.5
        currentValue = investedAmount + estimatedReturn + distributedProfits
      } else {
        // For other statuses, just add distributed profits
        currentValue = investedAmount + distributedProfits
      }

      currentPortfolioValue += currentValue
      totalDistributedProfits += distributedProfits

      // Calculate returns for completed deals differently
      let totalReturn = 0
      if (project.status === 'COMPLETED') {
        // For completed deals, return is just the distributed profits
        totalReturn = distributedProfits
      } else {
        // For active/funded deals, return is current value - invested amount
        totalReturn = currentValue - investedAmount
      }
      
      totalReturns += totalReturn

      // Calculate project progress
      let progress = 0
      if (project.status === 'COMPLETED') {
        progress = 100
      } else if (project.status === 'FUNDED') {
        progress = 100
      } else if (project.status === 'ACTIVE') {
        progress = Math.round((Number(project.currentFunding) / Number(project.fundingGoal)) * 100)
      } else {
        progress = Math.round((Number(project.currentFunding) / Number(project.fundingGoal)) * 100)
      }

      // For the individual investment display, show what the investment is worth now
      let displayCurrentValue = currentValue
      if (project.status === 'COMPLETED') {
        // For completed deals, show the distributed profits as the "current value"
        // since the original investment has been returned to wallet
        displayCurrentValue = distributedProfits
      }

      portfolioInvestments.push({
        id: investment.id,
        projectId: project.id,
        projectTitle: project.title,
        category: project.category,
        thumbnailImage: project.thumbnailImage,
        investedAmount: investedAmount,
        currentValue: Math.round(displayCurrentValue * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        returnPercentage: investedAmount > 0 ? Math.round((totalReturn / investedAmount) * 10000) / 100 : 0,
        distributedProfits: distributedProfits,
        unrealizedGains: Math.round((currentValue - investedAmount) * 100) / 100,
        progress: Math.min(progress, 100),
        status: project.status.toLowerCase(),
        investmentDate: investment.investmentDate.toISOString(),
        duration: project.duration,
        expectedReturn: Number(project.expectedReturn),
        endDate: project.endDate?.toISOString() || null
      })
    }

    // Calculate portfolio performance metrics
    const portfolioReturn = totalHistoricalInvested > 0 ? (totalReturns / totalHistoricalInvested) * 100 : 0
    
    // Calculate real daily change based on profit distributions from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get all profit distributions (RETURN transactions) from today
    const todayProfits = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'RETURN',
        status: 'COMPLETED',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    // Calculate today's change from profit distributions
    const todayProfitAmount = todayProfits.reduce(
      (sum, transaction) => sum + Number(transaction.amount), 0
    )
    
    // Also check for any new investments today (they would increase portfolio value)
    const todayInvestments = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'INVESTMENT',
        status: 'COMPLETED',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    const todayInvestmentAmount = todayInvestments.reduce(
      (sum, transaction) => sum + Number(transaction.amount), 0
    )
    
    // Daily change is primarily from profit distributions
    // New investments don't count as "gains" in daily change
    const dailyChangeAmount = Math.round(todayProfitAmount * 100) / 100
    const yesterdayPortfolioValue = currentPortfolioValue - dailyChangeAmount
    const dailyChangePercentage = yesterdayPortfolioValue > 0 ? (dailyChangeAmount / yesterdayPortfolioValue) * 100 : 0

    // Count active investments
    const activeInvestments = portfolioInvestments.filter(inv => 
      ['active', 'funded'].includes(inv.status)
    ).length

    // Get user's current wallet balance to include in total portfolio value
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true }
    })
    const walletBalance = Number(user?.walletBalance || 0)
    
    // Total portfolio value = active investments + wallet balance
    const totalPortfolioValue = currentPortfolioValue + walletBalance

    return NextResponse.json({
      portfolio: {
        totalValue: Math.round(totalPortfolioValue * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100, // Only active investments
        totalHistoricalInvested: Math.round(totalHistoricalInvested * 100) / 100, // All investments ever
        totalReturns: Math.round(totalReturns * 100) / 100,
        portfolioReturn: Math.round(portfolioReturn * 100) / 100,
        distributedProfits: Math.round(totalDistributedProfits * 100) / 100,
        unrealizedGains: Math.round((totalReturns - totalDistributedProfits) * 100) / 100,
        activeInvestments: activeInvestments,
        totalInvestments: portfolioInvestments.length
      },
      dailyChange: {
        amount: dailyChangeAmount,
        percentage: Math.round(dailyChangePercentage * 100) / 100,
        isPositive: dailyChangeAmount >= 0
      },
      investments: portfolioInvestments,
      summary: {
        bestPerformer: portfolioInvestments.length > 0 ? 
          portfolioInvestments.reduce((best, current) => 
            current.returnPercentage > best.returnPercentage ? current : best
          ) : null,
        totalProjects: portfolioInvestments.length,
        averageReturn: portfolioInvestments.length > 0 ? 
          Math.round((portfolioInvestments.reduce((sum, inv) => sum + inv.returnPercentage, 0) / portfolioInvestments.length) * 100) / 100 : 0
      }
    })

  } catch (error) {
    console.error('Error fetching portfolio overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}
