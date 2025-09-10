import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/partner/profit-distribution - Submit profit distribution request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Only partners can submit profit distributions' },
        { status: 403 }
      )
    }

    const { dealId, distributions } = await request.json()

    if (!dealId || !distributions || !Array.isArray(distributions)) {
      return NextResponse.json(
        { error: 'Deal ID and distributions are required' },
        { status: 400 }
      )
    }

    // Verify the deal belongs to this partner
    const deal = await prisma.project.findFirst({
      where: {
        id: dealId,
        ownerId: session.user.id
      },
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
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found or you do not have permission to distribute profits for this deal' },
        { status: 404 }
      )
    }

    // Validate distributions match actual investments
    const investorIds = new Set(deal.investments.map(inv => inv.investorId))
    const distributionInvestorIds = new Set(distributions.map(dist => dist.investorId))
    
    if (distributions.some(dist => !investorIds.has(dist.investorId))) {
      return NextResponse.json(
        { error: 'Some distributions are for investors who did not invest in this deal' },
        { status: 400 }
      )
    }

    // Calculate total distribution amount
    const totalDistributionAmount = distributions.reduce((sum, dist) => sum + Number(dist.profitAmount), 0)

    // Create profit distribution request for admin approval
    const distributionRequest = await prisma.profitDistributionRequest.create({
      data: {
        projectId: dealId,
        partnerId: session.user.id,
        description: `Profit distribution for ${deal.title}`,
        totalAmount: totalDistributionAmount,
        distributionData: JSON.stringify(distributions),
        status: 'PENDING'
        // requestedAt is automatically set by @default(now()) in schema
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profit distribution request submitted for admin approval',
      requestId: distributionRequest.id,
      totalAmount: totalDistributionAmount,
      investorCount: distributions.length
    })

  } catch (error) {
    console.error('Error submitting profit distribution:', error)
    return NextResponse.json(
      { error: 'Failed to submit profit distribution request' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}