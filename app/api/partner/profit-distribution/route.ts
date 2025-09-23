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

    const { 
      dealId, 
      estimatedGainPercent, 
      estimatedClosingPercent, 
      totalAmount, 
      distributionType, 
      description 
    } = await request.json()

    if (!dealId || !totalAmount || !estimatedGainPercent || !estimatedClosingPercent || !distributionType || !description) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    if (estimatedGainPercent < 0 || estimatedGainPercent > 100) {
      return NextResponse.json(
        { error: 'Estimated gain percent must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (estimatedClosingPercent < 0 || estimatedClosingPercent > 100) {
      return NextResponse.json(
        { error: 'Estimated closing percent must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (!['PARTIAL', 'FINAL'].includes(distributionType)) {
      return NextResponse.json(
        { error: 'Distribution type must be either PARTIAL or FINAL' },
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

    // Check if deal has any investments
    if (!deal.investments || deal.investments.length === 0) {
      return NextResponse.json(
        { error: 'This deal has no investments to distribute profits to' },
        { status: 400 }
      )
    }

    // Calculate values
    const estimatedProfit = (totalAmount * estimatedGainPercent) / 100
    const estimatedReturnCapital = totalAmount - estimatedProfit

    // Create profit distribution request for admin approval
    const distributionRequest = await prisma.profitDistributionRequest.create({
      data: {
        projectId: dealId,
        partnerId: session.user.id,
        description: description,
        totalAmount: totalAmount,
        estimatedGainPercent: estimatedGainPercent,
        estimatedClosingPercent: estimatedClosingPercent,
        distributionType: distributionType,
        estimatedProfit: estimatedProfit,
        estimatedReturnCapital: estimatedReturnCapital,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profit distribution request submitted for admin approval',
      requestId: distributionRequest.id,
      totalAmount: totalAmount,
      estimatedProfit: estimatedProfit,
      estimatedReturnCapital: estimatedReturnCapital,
      distributionType: distributionType,
      investorCount: deal.investments.length
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