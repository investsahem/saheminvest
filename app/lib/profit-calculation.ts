import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ProfitCalculationEngine {
  async calculateDealProfit(projectId: string, date: Date) {
    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        fundingGoal: true,
        currentFunding: true,
        expectedReturn: true,
        status: true
      }
    })

    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    const fundingGoal = Number(project.fundingGoal)
    const currentFunding = Number(project.currentFunding)
    const expectedReturn = Number(project.expectedReturn)

    // Simple profit calculation based on funding progress and expected return
    const fundingProgress = currentFunding / fundingGoal
    const dailyReturn = (expectedReturn / 100) / 365 // Convert annual return to daily
    const dailyProfit = currentFunding * dailyReturn * fundingProgress

    return {
      projectId,
      date: date.toISOString(),
      dailyProfit,
      cumulativeProfit: dailyProfit * 30, // Simplified 30-day cumulative
      performanceMetrics: {
        fundingProgress,
        dailyReturn: dailyReturn * 100,
        profitMargin: dailyProfit / currentFunding * 100
      }
    }
  }

  async getPendingDistributions() {
    // Get active projects that might have pending distributions
    const activeProjects = await prisma.project.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        investments: {
          select: {
            id: true,
            amount: true,
            investorId: true
          }
        }
      }
    })

    return activeProjects.map(project => ({
      id: project.id,
      title: project.title,
      investorPool: Number(project.currentFunding),
      estimatedProfit: Number(project.currentFunding) * (Number(project.expectedReturn) / 100) / 12, // Monthly estimate
      investorDistributions: project.investments.map(investment => ({
        investorId: investment.investorId,
        investorName: 'User',
        investorEmail: 'user@example.com',
        investmentAmount: Number(investment.amount),
        profitShare: Number(investment.amount) * (Number(project.expectedReturn) / 100) / 12
      }))
    }))
  }

  async processDistribution(distributionId: string) {
    // Simplified distribution processing
    // In a real implementation, this would handle profit calculations and distributions
    
    const project = await prisma.project.findUnique({
      where: { id: distributionId },
      include: {
        investments: {
          select: {
            id: true,
            amount: true,
            investorId: true
          }
        }
      }
    })

    if (!project) {
      throw new Error(`Project ${distributionId} not found`)
    }

    const transactions = []
    let totalDistributed = 0

    // Create mock distribution transactions
    for (const investment of project.investments) {
      const profitAmount = Number(investment.amount) * (Number(project.expectedReturn) / 100) / 12
      
      const transaction = await prisma.transaction.create({
        data: {
          userId: investment.investorId,
          investmentId: investment.id,
          type: 'RETURN',
          amount: profitAmount,
          status: 'COMPLETED',
          description: `Monthly profit distribution for ${project.title}`,
          reference: `PROFIT-${Date.now()}-${investment.id.slice(-6)}`
        }
      })

      transactions.push(transaction)
      totalDistributed += profitAmount
    }

    return {
      distributionId,
      transactions,
      totalDistributed,
      investorCount: project.investments.length
    }
  }
}

export const profitCalculationEngine = new ProfitCalculationEngine()
export default profitCalculationEngine