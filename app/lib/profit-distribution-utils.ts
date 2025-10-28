import { PrismaClient } from '@prisma/client'
import type {
  HistoricalPartialSummary,
  InvestorHistoricalData
} from '../types/profit-distribution'

const prisma = new PrismaClient()

/**
 * Fetch historical partial distributions for a specific deal
 */
export async function fetchHistoricalPartials(
  projectId: string
): Promise<{ summary: HistoricalPartialSummary; investorData: InvestorHistoricalData[] }> {
  try {
    // Get all PARTIAL profit distributions for this project
    const partialDistributions = await prisma.profitDistribution.findMany({
      where: {
        projectId,
        profitPeriod: 'PARTIAL',
        status: 'COMPLETED'
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        investment: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        distributionDate: 'asc'
      }
    })

    // Calculate summary
    const totalPartialProfit = partialDistributions.reduce(
      (sum, dist) => sum + Number(dist.amount),
      0
    )
    const totalPartialCapital = 0 // Partials don't return capital
    const distributionDates = [
      ...new Set(partialDistributions.map(d => d.distributionDate.toISOString().split('T')[0]))
    ]

    // Group by investor
    const investorMap = new Map<string, InvestorHistoricalData>()
    
    for (const dist of partialDistributions) {
      const investorId = dist.investorId
      
      if (!investorMap.has(investorId)) {
        investorMap.set(investorId, {
          investorId,
          investorName: dist.investor.name || 'Unknown',
          investorEmail: dist.investor.email,
          totalInvestment: Number(dist.investment.amount),
          partialDistributions: {
            count: 0,
            totalProfit: 0,
            totalCapital: 0,
            dates: []
          }
        })
      }

      const investorData = investorMap.get(investorId)!
      investorData.partialDistributions.count++
      investorData.partialDistributions.totalProfit += Number(dist.amount)
      
      const dateStr = dist.distributionDate.toISOString().split('T')[0]
      if (!investorData.partialDistributions.dates.includes(dateStr)) {
        investorData.partialDistributions.dates.push(dateStr)
      }
    }

    const summary: HistoricalPartialSummary = {
      totalPartialDistributions: totalPartialProfit,
      totalPartialProfit,
      totalPartialCapital,
      distributionDates,
      distributionCount: distributionDates.length
    }

    return {
      summary,
      investorData: Array.from(investorMap.values())
    }
  } catch (error) {
    console.error('Error fetching historical partials:', error)
    throw error
  }
}

// Note: Other utility functions (calculateInvestorDistributions, analyzeProfitability, etc.)
// have been moved to profit-distribution-client-utils.ts for use in client components
