import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DailyProfitService {
  // Mock implementation - generates realistic profit/loss patterns
  async processDealDailyProfit(dealId: string, date: Date) {
    // Mock implementation - generates realistic profit/loss patterns
    const project = await prisma.project.findUnique({
      where: { id: dealId },
      select: { 
        fundingGoal: true, 
        category: true,
        createdAt: true
      }
    })

    if (!project) {
      throw new Error(`Project ${dealId} not found`)
    }

    const fundingGoal = Number(project.fundingGoal)
    const currentValue = fundingGoal
    
    // Calculate days since project creation
    const daysSinceCreation = Math.floor(
      (date.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Generate realistic daily profit/loss based on project category and market conditions
    let baseReturn = 0.0002 // 0.02% daily base return
    
    // Adjust based on category risk
    switch (project.category) {
      case 'TECHNOLOGY':
        baseReturn *= 1.5 // Higher volatility
        break
      case 'REAL_ESTATE':
        baseReturn *= 0.8 // Lower volatility
        break
      case 'FINANCE':
        baseReturn *= 1.2
        break
      default:
        baseReturn *= 1.0
    }
    
    // Add some randomness (market volatility)
    const volatility = (Math.random() - 0.5) * 0.01 // ±0.5% random
    const dailyReturn = baseReturn + volatility
    
    // Calculate profit amount
    const dailyProfit = currentValue * dailyReturn
    
    // Simple performance metrics
    const performanceMetrics = {
      dailyReturn: dailyReturn * 100, // Convert to percentage
      volatility: Math.abs(volatility) * 100,
      trendDirection: dailyReturn > 0 ? 'up' : 'down',
      marketConditions: Math.random() > 0.7 ? 'volatile' : 'stable'
    }

    return {
      dealId,
      date: date.toISOString(),
      dailyProfit,
      cumulativeProfit: dailyProfit * daysSinceCreation, // Simplified cumulative
      performanceMetrics,
      processed: true
    }
  }

  // Process all active deals for a given date
  async processAllDeals(date: Date = new Date()) {
    const activeDeals = await prisma.project.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true
      }
    })

    const results = {
      date: date.toISOString(),
      processed: 0,
      failed: 0,
      totalProfitGenerated: 0,
      errors: [] as Array<{ dealId: string, error: string }>
    }

    for (const deal of activeDeals) {
      try {
        await this.processDealDailyProfit(deal.id, date)
        results.processed++
        
        // Calculate profits from transactions instead
        const profitTransactions = await prisma.transaction.findMany({
          where: {
            investment: {
              projectId: deal.id
            },
            type: 'RETURN',
            status: 'COMPLETED'
          }
        })
        
        const dealProfits = profitTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
        results.totalProfitGenerated += dealProfits
        
      } catch (error) {
        console.error(`Failed to process daily profit for deal ${deal.id}:`, error)
        results.failed++
        results.errors.push({
          dealId: deal.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  // Get profit history for a deal
  async getDealProfitHistory(dealId: string, startDate?: Date, endDate?: Date) {
    // Since we don't have a performance table, return mock data based on transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        investment: {
          projectId: dealId
        },
        type: 'RETURN',
        status: 'COMPLETED',
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return transactions.map(tx => ({
      date: tx.createdAt.toISOString(),
      profitAmount: Number(tx.amount),
      cumulativeProfit: Number(tx.amount),
      performanceMetrics: {
        dailyReturn: 0.5,
        volatility: 0.2,
        trendDirection: 'up',
        marketConditions: 'stable'
      }
    }))
  }
}

export const dailyProfitService = new DailyProfitService()
export default dailyProfitService