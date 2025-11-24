import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/deals/[id]/partial-history
// Fetch partial distribution history for a deal (for partners creating FINAL distributions)
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
    const dealId = params.id

    // Verify the deal belongs to this partner
    const deal = await prisma.project.findFirst({
      where: {
        id: dealId,
        partnerId: session.user.id
      }
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found or access denied' }, { status: 404 })
    }

    // Fetch all APPROVED PARTIAL distributions for this deal
    const partialDistributions = await prisma.profitDistributionRequest.findMany({
      where: {
        projectId: dealId,
        distributionType: 'PARTIAL',
        status: 'APPROVED'
      },
      orderBy: {
        reviewedAt: 'asc'
      }
    })

    // Calculate totals
    let totalPartialAmount = 0
    let totalPartialCapital = 0
    let totalPartialProfit = 0
    let totalReserved = 0
    let totalSahemCommission = 0

    partialDistributions.forEach(dist => {
      totalPartialAmount += Number(dist.totalAmount)
      totalReserved += Number(dist.reservedAmount || 0)
      totalSahemCommission += Number(dist.sahemInvestAmount || 0)
      
      // Partial distributions are CAPITAL RECOVERY (not profit)
      const amountToInvestors = Number(dist.totalAmount) - Number(dist.reservedAmount || 0) - Number(dist.sahemInvestAmount || 0)
      totalPartialCapital += amountToInvestors
      // totalPartialProfit stays at 0 for partials
    })

    return NextResponse.json({
      totalPartialAmount,
      totalPartialCapital,
      totalPartialProfit, // Should be 0
      totalReserved,
      totalSahemCommission,
      distributionCount: partialDistributions.length,
      message: partialDistributions.length > 0 
        ? `Found ${partialDistributions.length} partial distribution(s). Capital paid: $${totalPartialCapital.toFixed(2)}`
        : 'No partial distributions found'
    })

  } catch (error) {
    console.error('Error fetching partial history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partial history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

