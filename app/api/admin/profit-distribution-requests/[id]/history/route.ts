import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/profit-distribution-requests/[id]/history
// Fetch historical partial distribution data for a FINAL distribution request
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const requestId = params.id
    
    // Get the current distribution request
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            investments: {
              include: {
                investor: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (distributionRequest.distributionType !== 'FINAL') {
      return NextResponse.json({ 
        historicalSummary: {
          totalPartialAmount: 0,
          totalReserved: 0,
          totalSahemCommission: 0,
          distributionCount: 0,
          totalPartialProfit: 0,
          totalPartialCapital: 0
        },
        investorHistoricalData: []
      })
    }

    // Fetch all APPROVED PARTIAL distributions for this project
    const partialDistributions = await prisma.profitDistributionRequest.findMany({
      where: {
        projectId: distributionRequest.projectId,
        distributionType: 'PARTIAL',
        status: 'APPROVED'
      },
      orderBy: {
        reviewedAt: 'asc'
      }
    })

    // Calculate historical summary
    let totalPartialAmount = 0
    let totalReserved = 0
    let totalSahemCommission = 0
    let totalPartialProfit = 0
    let totalPartialCapital = 0

    partialDistributions.forEach(dist => {
      totalPartialAmount += Number(dist.totalAmount)
      totalReserved += Number(dist.reservedAmount || 0)
      totalSahemCommission += Number(dist.sahemInvestAmount || 0)
      // For partial distributions, the amount sent to investors is considered "profit"
      const amountToInvestors = Number(dist.totalAmount) - Number(dist.reservedAmount || 0) - Number(dist.sahemInvestAmount || 0)
      totalPartialProfit += amountToInvestors
    })

    // Calculate per-investor historical data
    const investorHistoricalMap = new Map<string, {
      investorId: string
      investorName: string
      investorEmail: string
      totalInvestment: number
      partialProfitReceived: number
      partialCapitalReceived: number
      distributionHistory: Array<{
        date: string
        amount: number
        type: 'PARTIAL'
      }>
    }>()

    // Initialize map with all investors
    distributionRequest.project.investments.forEach(investment => {
      const investorId = investment.investorId
      if (!investorHistoricalMap.has(investorId)) {
        investorHistoricalMap.set(investorId, {
          investorId: investorId,
          investorName: investment.investor.name || 'Unknown',
          investorEmail: investment.investor.email || '',
          totalInvestment: 0,
          partialProfitReceived: 0,
          partialCapitalReceived: 0,
          distributionHistory: []
        })
      }
      const data = investorHistoricalMap.get(investorId)!
      data.totalInvestment += Number(investment.amount)
    })

    // Calculate what each investor received in partial distributions
    const totalProjectInvestment = distributionRequest.project.investments.reduce(
      (sum, inv) => sum + Number(inv.amount), 0
    )

    partialDistributions.forEach(dist => {
      const amountToInvestors = Number(dist.totalAmount) - Number(dist.reservedAmount || 0) - Number(dist.sahemInvestAmount || 0)
      
      // Distribute proportionally to each investor
      investorHistoricalMap.forEach((data, investorId) => {
        const investorRatio = data.totalInvestment / totalProjectInvestment
        const investorShare = amountToInvestors * investorRatio
        
        data.partialProfitReceived += investorShare
        data.distributionHistory.push({
          date: dist.reviewedAt?.toISOString() || dist.createdAt.toISOString(),
          amount: investorShare,
          type: 'PARTIAL'
        })
      })
    })

    const investorHistoricalData = Array.from(investorHistoricalMap.values())

    return NextResponse.json({
      historicalSummary: {
        totalPartialAmount,
        totalReserved,
        totalSahemCommission,
        distributionCount: partialDistributions.length,
        totalPartialProfit,
        totalPartialCapital: 0 // Partials don't return capital
      },
      investorHistoricalData
    })

  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
