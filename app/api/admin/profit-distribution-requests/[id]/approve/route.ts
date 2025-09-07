import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
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

    // Get the profit distribution request
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            investments: {
              include: {
                investor: true
              }
            }
          }
        },
        partner: true
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (distributionRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Parse the distribution data
    const distributionData = JSON.parse(distributionRequest.distributionData as string)

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the request status
      await tx.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      // 2. Create profit distributions and transactions for each investor
      for (const distribution of distributionData) {
        const investment = distributionRequest.project.investments.find(
          inv => inv.investor.id === distribution.investorId
        )

        if (investment) {
          // Create profit distribution record
          await tx.profitDistribution.create({
            data: {
              projectId: distributionRequest.projectId,
              investorId: distribution.investorId,
              investmentId: investment.id,
              amount: distribution.profitAmount,
              profitRate: distribution.profitRate,
              investmentShare: (Number(distribution.investmentAmount) / Number(distributionRequest.totalAmount)) * 100,
              distributionDate: new Date(),
              status: 'COMPLETED',
              profitPeriod: distributionRequest.distributionType || 'FINAL'
            }
          })

          // Create transaction record for the profit
          await tx.transaction.create({
            data: {
              userId: distribution.investorId,
              type: 'RETURN',
              amount: distribution.profitAmount,
              status: 'COMPLETED',
              description: `${distributionRequest.distributionType === 'PARTIAL' ? 'Partial' : 'Final'} profit distribution from ${distributionRequest.project.title}`
            }
          })

          // Update investor's wallet balance and total returns
          const investor = await tx.user.findUnique({
            where: { id: distribution.investorId }
          })

          if (investor) {
            await tx.user.update({
              where: { id: distribution.investorId },
              data: {
                walletBalance: (investor.walletBalance || 0) + distribution.profitAmount,
                totalReturns: (investor.totalReturns || 0) + distribution.profitAmount
              }
            })
          }
        }
      }

      // 3. Create notification for partner
      await tx.notification.create({
        data: {
          userId: distributionRequest.partnerId,
          type: 'PROFIT_DISTRIBUTION_APPROVED',
          title: 'تم الموافقة على توزيع الأرباح',
          message: `تم الموافقة على طلب توزيع الأرباح للصفقة "${distributionRequest.project.title}" وتم توزيع ${distributionRequest.totalAmount} دولار على المستثمرين.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            requestId: distributionRequest.id,
            totalAmount: distributionRequest.totalAmount,
            distributionType: distributionRequest.distributionType
          }),
          read: false
        }
      })

      // 4. Create notifications for investors
      for (const distribution of distributionData) {
        await tx.notification.create({
          data: {
            userId: distribution.investorId,
            type: 'PROFIT_RECEIVED',
            title: 'تم استلام أرباح جديدة',
            message: `تم إضافة ${distribution.profitAmount} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك.`,
            metadata: JSON.stringify({
              dealId: distributionRequest.projectId,
              profitAmount: distribution.profitAmount,
              profitRate: distribution.profitRate,
              distributionType: distributionRequest.distributionType
            }),
            read: false
          }
        })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profit distribution approved and processed successfully' 
    })

  } catch (error) {
    console.error('Error approving profit distribution:', error)
    return NextResponse.json(
      { error: 'Failed to approve profit distribution' },
      { status: 500 }
    )
  }
}
