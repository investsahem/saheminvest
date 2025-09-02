import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import profitCalculationEngine from '../../../../lib/profit-calculation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/investments/[id]/profits - Get profit history for an investment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: investmentId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the investment to verify ownership or permissions
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
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
            category: true,
            ownerId: true
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

    // Check permissions: investor owns it, partner owns the project, or admin/financial officer
    const hasPermission = 
      investment.investorId === session.user.id ||
      investment.project.ownerId === session.user.id ||
      ['ADMIN', 'FINANCIAL_OFFICER', 'PORTFOLIO_ADVISOR'].includes(session.user.role)

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') // e.g., '30days', '3months'

    let actualStartDate: Date | undefined
    let actualEndDate: Date | undefined

    if (period) {
      const now = new Date()
      switch (period) {
        case '7days':
          actualStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          actualStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          actualStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '6months':
          actualStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case '1year':
          actualStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }
    } else {
      if (startDate) actualStartDate = new Date(startDate)
      if (endDate) actualEndDate = new Date(endDate)
    }

    // Get profit history from transactions
    const profitHistory = await prisma.transaction.findMany({
      where: {
        investmentId: investmentId,
        type: 'RETURN',
        status: 'COMPLETED',
        ...(actualStartDate && { createdAt: { gte: actualStartDate } }),
        ...(actualEndDate && { createdAt: { lte: actualEndDate } })
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate summary statistics
    const totalProfitEarned = profitHistory.reduce((sum: number, profit: any) => 
      sum + Number(profit.amount), 0
    )
    
    const totalInvestment = Number(investment.amount)
    const profitPercentage = totalInvestment > 0 ? (totalProfitEarned / totalInvestment) * 100 : 0
    
    const lastProfitDate = profitHistory.length > 0 ? 
      profitHistory[0].createdAt.toISOString() : null

    return NextResponse.json({
      success: true,
      investment: {
        id: investment.id,
        amount: investment.amount,
        investmentDate: investment.investmentDate,
        totalProfitEarned: totalProfitEarned,
        lastProfitDate: lastProfitDate,
        investmentShare: profitPercentage
      },
      project: investment.project,
      investor: investment.investor,
      summary: {
        totalInvestment,
        totalProfitEarned,
        profitPercentage,
        totalDistributions: profitHistory.length,
        lastProfitDate
      },
      profitHistory,
      period: period || 'custom'
    })

  } catch (error) {
    console.error('Investment profit retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve investment profits' },
      { status: 500 }
    )
  }
}



