import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/investments/project/[id]/details - Get aggregated investment details for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all investments for this project by the current user
    const investments = await prisma.investment.findMany({
      where: {
        projectId: projectId,
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
                companyName: true,
                name: true
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
      },
      orderBy: {
        investmentDate: 'asc' // Earliest investment first
      }
    })

    if (!investments || investments.length === 0) {
      return NextResponse.json(
        { error: 'No investments found for this project' },
        { status: 404 }
      )
    }

    // Get all profit distribution transactions for all investments in this project
    const investmentIds = investments.map(inv => inv.id)
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        investmentId: { in: investmentIds },
        type: 'RETURN',
        status: 'COMPLETED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all pending profit distributions
    const pendingProfits = await prisma.transaction.findMany({
      where: {
        investmentId: { in: investmentIds },
        type: 'RETURN',
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Aggregate all investment amounts
    const totalInvestedAmount = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalDistributedProfits = profitTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
    const totalPendingProfits = pendingProfits.reduce((sum, tx) => sum + Number(tx.amount), 0)

    // Use the first investment's project data (all should be the same)
    const project = investments[0].project
    const investor = investments[0].investor

    // Calculate current value based on project performance
    let currentValue = totalInvestedAmount
    if (project.status === 'COMPLETED' || project.status === 'FUNDED') {
      const projectCurrentValue = Number(project.currentFunding)
      const fundingRatio = totalInvestedAmount / Number(project.fundingGoal)
      currentValue = projectCurrentValue * fundingRatio
    } else if (project.status === 'ACTIVE') {
      // For active projects, current value is just the invested amount
      currentValue = totalInvestedAmount
    }

    // Calculate returns
    const totalReturn = (currentValue - totalInvestedAmount) + totalDistributedProfits
    const returnPercentage = totalInvestedAmount > 0 ? (totalReturn / totalInvestedAmount) * 100 : 0

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
    if (project.status === 'COMPLETED' && totalDistributedProfits > 0) {
      lifecycleStage = 'COMPLETED_WITH_PROFITS'
    } else if (project.status === 'COMPLETED') {
      lifecycleStage = 'COMPLETED'
    } else if (totalPendingProfits > 0) {
      lifecycleStage = 'PROFITS_PENDING'
    } else if (totalDistributedProfits > 0) {
      lifecycleStage = 'PROFITS_DISTRIBUTED'
    }

    // Use the earliest investment date
    const earliestInvestmentDate = investments[0].investmentDate

    const aggregatedInvestmentDetails = {
      id: `project-${projectId}`, // Use a composite ID since this represents multiple investments
      investedAmount: totalInvestedAmount,
      currentValue: Math.round(currentValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      distributedProfits: totalDistributedProfits,
      pendingProfits: totalPendingProfits,
      unrealizedGains: Math.round((currentValue - totalInvestedAmount) * 100) / 100,
      progress: Math.min(progress, 100),
      status: project.status.toLowerCase(),
      lifecycleStage: lifecycleStage,
      investmentDate: earliestInvestmentDate.toISOString(),
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
          name: project.partner.companyName || project.partner.name || 'Unknown Partner'
        } : null
      },
      investor: investor,
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
      })),
      // Additional info about the aggregated investments
      investmentCount: investments.length,
      investmentDates: investments.map(inv => inv.investmentDate.toISOString())
    }

    return NextResponse.json(aggregatedInvestmentDetails)

  } catch (error) {
    console.error('Error fetching aggregated investment details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment details' },
      { status: 500 }
    )
  }
}
