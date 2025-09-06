import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { dealId, distributions } = await request.json()

    if (!dealId || !distributions || !Array.isArray(distributions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the deal belongs to the current partner
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        investments: {
          include: {
            investor: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (deal.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only distribute profits for your own deals' },
        { status: 403 }
      )
    }

    // Create a profit distribution request for admin approval
    const profitDistributionRequest = await prisma.profitDistributionRequest.create({
      data: {
        projectId: dealId,
        partnerId: session.user.id,
        totalAmount: distributions.reduce((sum: number, dist: any) => sum + dist.profitAmount, 0),
        status: 'PENDING',
        distributionData: JSON.stringify(distributions),
        description: `Profit distribution request for ${deal.title}`,
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create a notification for admins
    await prisma.notification.create({
      data: {
        userId: session.user.id, // This will be updated to notify all admins
        type: 'PROFIT_DISTRIBUTION_REQUEST',
        title: 'New Profit Distribution Request',
        message: `${session.user.name} has requested to distribute profits for deal "${deal.title}"`,
        metadata: {
          dealId,
          requestId: profitDistributionRequest.id,
          partnerName: session.user.name,
          totalAmount: profitDistributionRequest.totalAmount
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      requestId: profitDistributionRequest.id,
      message: 'Profit distribution request submitted for admin approval'
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
