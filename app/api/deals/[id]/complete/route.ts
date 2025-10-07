import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import notificationService from '../../../../lib/notifications'

const prisma = new PrismaClient()

// POST /api/deals/[id]/complete - Mark a deal as completed and return capital to investors
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to complete deals
    if (!['ADMIN', 'DEAL_MANAGER', 'FINANCIAL_OFFICER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { finalProfitRate, completionNotes } = await request.json()

    // Get the deal with all investments
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
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
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (deal.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Deal is already completed' },
        { status: 400 }
      )
    }

    // Use the provided profit rate or the expected return as default
    const profitRate = finalProfitRate !== undefined ? finalProfitRate : Number(deal.expectedReturn)

    const result = await prisma.$transaction(async (tx) => {
      // Update deal status to COMPLETED
      const updatedDeal = await tx.project.update({
        where: { id: dealId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualReturn: profitRate,
          completionNotes: completionNotes || `Deal completed with ${profitRate}% return`
        }
      })

      const capitalReturns = []
      const profitDistributions = []

      // Process each investment
      for (const investment of deal.investments) {
        const investmentAmount = Number(investment.amount)
        const profitAmount = (investmentAmount * profitRate) / 100

        // 1. Return the original capital to investor's wallet
        const capitalReturn = await tx.transaction.create({
          data: {
            userId: investment.investorId,
            investmentId: investment.id,
            type: 'RETURN',
            amount: investmentAmount,
            status: 'COMPLETED',
            description: `Capital return from completed deal: ${deal.title}`,
            reference: `CAP-${Date.now()}-${investment.id.slice(-6)}`
          }
        })

        // 2. Distribute profits (if any)
        let profitReturn = null
        if (profitAmount > 0) {
          profitReturn = await tx.transaction.create({
            data: {
              userId: investment.investorId,
              investmentId: investment.id,
              type: 'RETURN',
              amount: profitAmount,
              status: 'COMPLETED',
              description: `Profit distribution from completed deal: ${deal.title} (${profitRate}% return)`,
              reference: `PROFIT-${Date.now()}-${investment.id.slice(-6)}`
            }
          })
        }

        // 3. Update investor's wallet balance
        await tx.user.update({
          where: { id: investment.investorId },
          data: {
            walletBalance: {
              increment: investmentAmount + profitAmount // Capital + Profit
            },
            totalReturns: {
              increment: profitAmount // Only count profit as returns
            }
          }
        })

        // 4. Mark investment as completed
        await tx.investment.update({
          where: { id: investment.id },
          data: {
            status: 'COMPLETED',
            actualReturn: profitAmount,
            completedAt: new Date()
          }
        })

        capitalReturns.push(capitalReturn)
        if (profitReturn) {
          profitDistributions.push(profitReturn)
        }

        // Send notification to investor
        try {
          await notificationService.notifyDealCompletion(
            investment.investorId,
            deal.title,
            investmentAmount,
            profitAmount,
            profitRate
          )
        } catch (notificationError) {
          console.error('Failed to send completion notification:', notificationError)
        }
      }

      return {
        deal: updatedDeal,
        capitalReturns,
        profitDistributions,
        totalCapitalReturned: deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0),
        totalProfitsDistributed: deal.investments.reduce((sum, inv) => sum + (Number(inv.amount) * profitRate) / 100, 0),
        investorCount: deal.investments.length
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deal "${deal.title}" completed successfully`,
      data: result
    })

  } catch (error) {
    console.error('Error completing deal:', error)
    return NextResponse.json(
      { error: 'Failed to complete deal' },
      { status: 500 }
    )
  }
}
