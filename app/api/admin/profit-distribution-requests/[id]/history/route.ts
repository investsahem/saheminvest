import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { fetchHistoricalPartials } from '../../../../../lib/profit-distribution-utils'

// GET /api/admin/profit-distribution-requests/[id]/history
// Fetch historical partial distribution data for a distribution request's deal
export async function GET(
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

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Get the distribution request to find the projectId
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      select: {
        projectId: true,
        distributionType: true,
        project: {
          select: {
            id: true,
            title: true,
            currentFunding: true,
            investments: {
              select: {
                id: true,
                amount: true,
                investorId: true,
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
        }
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Distribution request not found' }, { status: 404 })
    }

    // Fetch historical partial distributions
    const { summary, investorData } = await fetchHistoricalPartials(distributionRequest.projectId)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      requestId,
      projectId: distributionRequest.projectId,
      projectTitle: distributionRequest.project.title,
      distributionType: distributionRequest.distributionType,
      historicalSummary: summary,
      investorHistoricalData: investorData,
      investments: distributionRequest.project.investments.map(inv => ({
        investorId: inv.investorId,
        investorName: inv.investor.name || 'Unknown',
        investorEmail: inv.investor.email,
        amount: Number(inv.amount)
      }))
    })

  } catch (error) {
    console.error('Error fetching historical distribution data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical distribution data' },
      { status: 500 }
    )
  }
}

