import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/investments/[id]/details - Get detailed investment information with profit history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch investment with all related data
    const investment = await prisma.investment.findFirst({
      where: {
        id: id,
        investorId: session.user.id // Ensure user can only see their own investments
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            thumbnailImage: true,
            images: true,
            fundingGoal: true,
            currentFunding: true,
            expectedReturn: true,
            duration: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            partner: {
              select: {
                id: true,
                companyName: true
              }
            }
          }
        },
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    // Get all profit distribution transactions for this investment
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        investmentId: investment.id,
        type: 'RETURN',
        status: 'COMPLETED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all pending profit distributions (if any)
    const pendingProfits = await prisma.transaction.findMany({
      where: {
        investmentId: investment.id,
        type: 'RETURN',
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate investment performance metrics
    const investedAmount = Number(investment.amount)
    const distributedProfits = profitTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount), 0
    )
    const pendingProfitAmount = pendingProfits.reduce(
      (sum, tx) => sum + Number(tx.amount), 0
    )

    // Calculate current value based on project performance
    let currentValue = investedAmount
    const project = investment.project

    if (project.status === 'COMPLETED' || project.status === 'FUNDED') {
      const projectCurrentValue = Number(project.currentFunding)
      const fundingRatio = investedAmount / Number(project.fundingGoal)
      currentValue = projectCurrentValue * fundingRatio
    } else if (project.status === 'ACTIVE') {
      // For active projects, current value is just the invested amount
      // Profits are only added when actually distributed by partner and approved by admin
      currentValue = investedAmount
    }

    // Calculate returns
    const totalReturn = (currentValue - investedAmount) + distributedProfits
    const returnPercentage = investedAmount > 0 ? (totalReturn / investedAmount) * 100 : 0

    // Calculate project progress
    let progress = 0
    if (project.status === 'COMPLETED') {
      progress = 100
    } else if (project.status === 'FUNDED') {
      progress = 100
    } else if (project.status === 'ACTIVE') {
      progress = Math.round((Number(project.currentFunding) / Number(project.fundingGoal)) * 100)
    }

    // Determine investment lifecycle stage
    let lifecycleStage = 'ACTIVE'
    if (project.status === 'COMPLETED' && distributedProfits > 0) {
      lifecycleStage = 'COMPLETED_WITH_PROFITS'
    } else if (project.status === 'COMPLETED') {
      lifecycleStage = 'COMPLETED'
    } else if (pendingProfitAmount > 0) {
      lifecycleStage = 'PROFITS_PENDING'
    } else if (distributedProfits > 0) {
      lifecycleStage = 'PROFITS_DISTRIBUTED'
    }

    const investmentDetails = {
      id: investment.id,
      investedAmount: investedAmount,
      currentValue: Math.round(currentValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      distributedProfits: distributedProfits,
      pendingProfits: pendingProfitAmount,
      unrealizedGains: Math.round((currentValue - investedAmount) * 100) / 100,
      progress: Math.min(progress, 100),
      status: project.status.toLowerCase(),
      lifecycleStage: lifecycleStage,
      investmentDate: investment.investmentDate.toISOString(),
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        thumbnailImage: project.thumbnailImage,
        images: project.images,
        fundingGoal: Number(project.fundingGoal),
        currentFunding: Number(project.currentFunding),
        expectedReturn: Number(project.expectedReturn),
        duration: project.duration,
        endDate: project.endDate?.toISOString() || null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        partner: project.partner ? {
          id: project.partner.id,
          companyName: project.partner.companyName,
          name: project.partner.companyName || 'Unknown Partner'
        } : null
      },
      investor: investment.investor,
      profitHistory: profitTransactions.map(tx => ({
        id: tx.id,
        amount: Number(tx.amount),
        description: tx.description,
        status: tx.status,
        method: tx.method,
        reference: tx.reference,
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString()
      })),
      pendingProfitDistributions: pendingProfits.map(tx => ({
        id: tx.id,
        amount: Number(tx.amount),
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt.toISOString()
      }))
    }

    return NextResponse.json(investmentDetails)

  } catch (error) {
    console.error('Error fetching investment details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment details' },
      { status: 500 }
    )
  }
}
