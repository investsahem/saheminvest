import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { profitCalculationEngine } from '../../../../lib/profit-calculation'

// POST /api/deals/[id]/performance - Record daily performance for a deal
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

    // Check if user has permission to record performance
    if (!['ADMIN', 'FINANCIAL_OFFICER', 'DEAL_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { date, autoDistribute = false } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const performanceDate = new Date(date)
    
    // Process the profit calculation
    const result = await profitCalculationEngine.calculateDealProfit(dealId, performanceDate)

    // If auto-distribute is enabled and user has permission, execute payouts
    let payoutResult = null
    if (autoDistribute && ['ADMIN', 'FINANCIAL_OFFICER'].includes(session.user.role)) {
      try {
        payoutResult = await profitCalculationEngine.processDistribution(dealId)
      } catch (payoutError) {
        console.error('Auto-distribution failed:', payoutError)
        // Don't fail the entire operation if auto-distribution fails
      }
    }

    return NextResponse.json({
      success: true,
      performance: result,
      payout: payoutResult,
      message: autoDistribute && payoutResult 
        ? 'Performance recorded and profits distributed successfully'
        : 'Performance recorded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Performance recording error:', error)
    return NextResponse.json(
      { error: 'Failed to record performance' },
      { status: 500 }
    )
  }
}

// GET /api/deals/[id]/performance - Get performance history for a deal
export async function GET(
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    // Get simplified performance data
    const currentPerformance = await profitCalculationEngine.calculateDealProfit(
      dealId, 
      new Date()
    )

    return NextResponse.json({
      success: true,
      current: currentPerformance,
      history: [], // Simplified - no historical data for now
      summary: {
        totalRecords: 1,
        dateRange: {
          start: startDate || new Date().toISOString(),
          end: endDate || new Date().toISOString()
        },
        averageDailyProfit: currentPerformance.dailyProfit,
        totalCumulativeProfit: currentPerformance.cumulativeProfit
      }
    })

  } catch (error) {
    console.error('Performance retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}