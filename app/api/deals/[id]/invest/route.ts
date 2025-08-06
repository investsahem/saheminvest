import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import emailService from '../../../../lib/email'
import notificationService from '../../../../lib/notifications'

const prisma = new PrismaClient()

// POST /api/deals/[id]/invest - Make an investment
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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid investment amount' },
        { status: 400 }
      )
    }

    // Get the deal
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        investments: {
          select: {
            amount: true
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

    // Check if deal is available for investment
    if (!['PUBLISHED', 'ACTIVE'].includes(deal.status)) {
      return NextResponse.json(
        { error: 'Deal is not available for investment' },
        { status: 400 }
      )
    }

    // Check minimum investment
    if (amount < deal.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment amount is $${deal.minInvestment}` },
        { status: 400 }
      )
    }

    // Check if deal is fully funded
    const currentFunding = deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const fundingGoalNumber = Number(deal.fundingGoal)
    if (currentFunding >= fundingGoalNumber) {
      return NextResponse.json(
        { error: 'Deal is fully funded' },
        { status: 400 }
      )
    }

    // Check if investment would exceed funding goal
    if (currentFunding + amount > fundingGoalNumber) {
      const remainingAmount = fundingGoalNumber - currentFunding
      return NextResponse.json(
        { error: `Investment amount exceeds remaining funding needed. Maximum investment: $${remainingAmount}` },
        { status: 400 }
      )
    }

    // Get user's wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has sufficient balance
    if (Number(user.walletBalance) < amount) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Your balance: $${user.walletBalance}` },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the investment
      const investment = await tx.investment.create({
        data: {
          amount: amount,
          status: 'ACTIVE',
          expectedReturn: (amount * Number(deal.expectedReturn)) / 100,
          investorId: session.user.id,
          projectId: dealId,
          investmentDate: new Date()
        },
        include: {
          investor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              title: true,
              expectedReturn: true
            }
          }
        }
      })

      // Deduct amount from user's wallet
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: {
            decrement: amount
          },
          totalInvested: {
            increment: amount
          }
        }
      })

      // Update project's current funding
      const updatedProject = await tx.project.update({
        where: { id: dealId },
        data: {
          currentFunding: {
            increment: amount
          }
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          amount: amount,
          type: 'INVESTMENT',
          status: 'COMPLETED',
          description: `Investment in ${deal.title}`,
          reference: `INV-${Date.now()}`,
          userId: session.user.id,
          investmentId: investment.id
        }
      })

      // Check if project is now fully funded
      const newCurrentFunding = Number(updatedProject.currentFunding)
      if (newCurrentFunding >= fundingGoalNumber) {
        await tx.project.update({
          where: { id: dealId },
          data: {
            status: 'FUNDED'
          }
        })
      }

      return investment
    })

    // Send notifications and emails after successful investment
    try {
      const reference = `INV-${Date.now()}`
      
      // Send email to investor
      await emailService.sendInvestmentConfirmationEmail(
        session.user.email!,
        session.user.name || 'Investor',
        amount,
        deal.title,
        reference
      )

      // Send push notification to investor
      await notificationService.notifyInvestmentSuccess(
        session.user.id,
        amount,
        deal.title,
        reference
      )

      // Notify admins of new investment
      await notificationService.notifyNewInvestment(
        amount,
        session.user.email!,
        deal.title
      )
    } catch (notificationError) {
      console.error('Failed to send investment notifications:', notificationError)
      // Don't fail the investment if notifications fail
    }

    return NextResponse.json({
      success: true,
      investment: result,
      message: 'Investment completed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Investment error:', error)
    return NextResponse.json(
      { error: 'Failed to process investment' },
      { status: 500 }
    )
  }
}