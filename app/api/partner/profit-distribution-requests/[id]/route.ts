import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/profit-distribution-requests/[id]
// Get detailed information about a specific distribution request (partner view)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const requestId = params.id

    // Fetch the distribution request
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            currentFunding: true,
            fundingGoal: true,
            status: true
          }
        }
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Distribution request not found' }, { status: 404 })
    }

    // Verify that this partner owns this request
    if (distributionRequest.partnerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch historical partial distributions (aggregated - no investor names)
    const partialDistributions = await prisma.profitDistribution.findMany({
      where: {
        projectId: distributionRequest.projectId,
        profitPeriod: 'PARTIAL',
        status: 'COMPLETED'
      },
      select: {
        amount: true,
        distributionDate: true
      },
      orderBy: {
        distributionDate: 'asc'
      }
    })

    // Calculate aggregated historical data
    const totalPartialAmount = partialDistributions.reduce(
      (sum, dist) => sum + Number(dist.amount),
      0
    )
    const distributionDates = [
      ...new Set(partialDistributions.map(d => d.distributionDate.toISOString().split('T')[0]))
    ]

    // Calculate commission breakdown
    const estimatedProfit = Number(distributionRequest.estimatedProfit)
    const sahemPercent = Number(distributionRequest.sahemInvestPercent || 10)
    const reservePercent = Number(distributionRequest.reservedGainPercent || 10)
    
    const sahemInvestAmount = (estimatedProfit * sahemPercent) / 100
    const reservedAmount = (estimatedProfit * reservePercent) / 100
    const investorPool = estimatedProfit - sahemInvestAmount - reservedAmount

    // Determine profitability status
    const isProfitable = estimatedProfit > 0
    const profitOrLossAmount = estimatedProfit

    return NextResponse.json({
      success: true,
      requestId: distributionRequest.id,
      dealId: distributionRequest.projectId,
      dealTitle: distributionRequest.project.title,
      dealStatus: distributionRequest.project.status,
      distributionType: distributionRequest.distributionType,
      status: distributionRequest.status,
      totalAmount: Number(distributionRequest.totalAmount),
      estimatedGainPercent: Number(distributionRequest.estimatedGainPercent),
      estimatedClosingPercent: Number(distributionRequest.estimatedClosingPercent),
      description: distributionRequest.description,
      requestedAt: distributionRequest.requestedAt.toISOString(),
      reviewedAt: distributionRequest.reviewedAt?.toISOString() || null,
      rejectionReason: distributionRequest.rejectionReason,
      historicalSummary: {
        partialDistributionCount: distributionDates.length,
        totalPartialAmount,
        distributionDates
      },
      commissionBreakdown: {
        sahemInvestAmount,
        sahemPercent,
        reservedAmount,
        reservePercent,
        investorPool,
        totalProfit: estimatedProfit
      },
      profitabilityStatus: {
        isProfitable,
        statusMessage: isProfitable 
          ? 'الصفقة حققت أرباحاً'
          : 'الصفقة لم تحقق الأرباح المتوقعة',
        profitOrLossAmount
      }
    })

  } catch (error) {
    console.error('Error fetching partner distribution details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distribution details' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

