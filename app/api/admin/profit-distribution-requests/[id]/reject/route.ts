import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()
    const requestId = params.id

    // Get the profit distribution request
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: true,
        partner: true
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (distributionRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the request status
      await tx.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: reason
        }
      })

      // 2. Create notification for partner
      await tx.notification.create({
        data: {
          userId: distributionRequest.partnerId,
          type: 'PROFIT_DISTRIBUTION_REJECTED',
          title: 'تم رفض طلب توزيع الأرباح',
          message: `تم رفض طلب توزيع الأرباح للصفقة "${distributionRequest.project.title}". السبب: ${reason}`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            requestId: distributionRequest.id,
            rejectionReason: reason,
            totalAmount: distributionRequest.totalAmount
          }),
          isRead: false
        }
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profit distribution request rejected successfully' 
    })

  } catch (error) {
    console.error('Error rejecting profit distribution:', error)
    return NextResponse.json(
      { error: 'Failed to reject profit distribution request' },
      { status: 500 }
    )
  }
}
