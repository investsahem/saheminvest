import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/profit-distribution-requests - Get partner's distribution requests
export async function GET(request: NextRequest) {
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
        { error: 'Only partners can access their distribution requests' },
        { status: 403 }
      )
    }

    // Fetch all distribution requests for this partner
    const requests = await prisma.profitDistributionRequest.findMany({
      where: {
        partnerId: session.user.id
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      requests: requests.map(request => ({
        id: request.id,
        projectId: request.projectId,
        project: {
          title: request.project.title,
          status: request.project.status
        },
        totalAmount: Number(request.totalAmount),
        estimatedGainPercent: Number(request.estimatedGainPercent),
        estimatedClosingPercent: Number(request.estimatedClosingPercent),
        distributionType: request.distributionType,
        description: request.description,
        status: request.status,
        requestedAt: request.requestedAt.toISOString(),
        reviewedAt: request.reviewedAt?.toISOString() || null,
        rejectionReason: request.rejectionReason
      }))
    })

  } catch (error) {
    console.error('Error fetching partner distribution requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distribution requests' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
